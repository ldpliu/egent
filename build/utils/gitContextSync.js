import path from 'path';
import fs from 'fs-extra'; // Using fs-extra for ensureDirSync
import os from 'os';
import simpleGit from 'simple-git';
import crypto from 'crypto';

/**
 * Generate a unique directory name for a repository URL
 * @param {string} repoUrl - The repository URL
 * @returns {string} - A unique, safe directory name
 */
function generateRepoDirName(repoUrl) {
  // Extract repo name from URL (e.g., "owner/repo" from "git@github.com:owner/repo.git")
  const match = repoUrl.match(/[:/]([^/]+\/[^/]+?)(\.git)?$/);
  if (!match) {
    // Fallback to hash if can't extract repo name
    return crypto.createHash('sha256').update(repoUrl).digest('hex').slice(0, 12);
  }

  const repoFullName = match[1].replace('/', '--');
  // Add a hash of the full URL to handle same-named repos from different sources
  const urlHash = crypto.createHash('sha256').update(repoUrl).digest('hex').slice(0, 8);
  return `${repoFullName}-${urlHash}`;
}

/**
 * Get the cache directory path for a specific repository
 * @param {string} repoUrl - The repository URL
 * @returns {string} - The absolute path to the cache directory
 */
function getCacheDir(repoUrl) {
  const repoDirName = generateRepoDirName(repoUrl);
  return path.join(os.homedir(), '.egent', 'repos', repoDirName);
}

const options = {
   baseDir: process.cwd(),
   binary: 'git',
   maxConcurrentProcesses: 6,
   trimmed: false,
};

/**
 * Synchronizes a remote Git repository to a local cache directory.
 * Clones the repo if it doesn't exist locally, otherwise fetches updates.
 * Checks out a specific ref (branch, tag, commit) if provided.
 *
 * @param repoUrl The URL of the Git repository.
 * @param repoRef Optional specific branch, tag, or commit hash to checkout.
 * @returns The absolute path to the synchronized local repository.
 * @throws Error if synchronization fails.
 */
export async function syncContextRepo(repoUrl, repoRef) {
  console.log(`[DEBUG] Starting git sync process for repo: ${repoUrl} at ref: ${repoRef}`);

  const CACHE_DIR = getCacheDir(repoUrl);
  console.log(`[DEBUG] Using cache directory: ${CACHE_DIR}`);

  try {
    // Ensure the cache directory exists
    fs.ensureDirSync(path.dirname(CACHE_DIR)); // Ensure parent exists

    let git;

    // Check if the repository directory already exists
    const repoExists = await fs.pathExists(CACHE_DIR);

    if (repoExists) {
      options.baseDir = CACHE_DIR;
      git = simpleGit(options);

      // Verify it's a git repository
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        await fs.remove(CACHE_DIR);
        return cloneRepo(repoUrl, repoRef, CACHE_DIR);
      }

      // Fetch updates from the remote
      await git.fetch('origin');

      // Determine the target ref: specified ref or default branch (e.g., main/master)
      const targetRef = repoRef || await getDefaultBranch(git);

      // Reset local state to match the remote branch/ref cleanly
      // Using reset --hard is aggressive but ensures a clean state, suitable for a cache
      await git.reset(['--hard', `origin/${targetRef}`]);

      // If a specific (non-branch) ref like a tag or commit was requested, check it out explicitly
      // Note: reset --hard origin/<branch> already handles switching branches. This is for tags/commits.
      if (repoRef && !(await isBranch(git, repoRef))) {
          await git.checkout(repoRef);
      } else if (repoRef && (await isBranch(git, repoRef))) {
         // We already reset to the branch via origin/<branch>, ensure local branch points correctly
         // This might be redundant after reset --hard, but ensures the local branch exists and tracks
         await git.checkout(repoRef);
      }

    } else {
      return cloneRepo(repoUrl, repoRef, CACHE_DIR);
    }

    console.log(`[DEBUG] Git sync completed successfully`);
    return CACHE_DIR;

  } catch (error) {
    console.error(`[ERROR] Git sync failed:`, error.message || error);
    throw new Error(`Failed to synchronize context repository: ${error.message}`);
  }
}

/**
 * Clones the repository and checks out the ref if specified.
 */
async function cloneRepo(repoUrl, repoRef, cacheDir) {
   // Ensure the target directory does not exist before cloning
   await fs.remove(cacheDir); // Remove if partially created or is a non-git dir

   // Adjust options for cloning (baseDir should be parent of cacheDir)
   const cloneOptions = { ...options, baseDir: path.dirname(cacheDir) };
   const git = simpleGit(cloneOptions);

   // Clone command
   await git.clone(repoUrl, cacheDir); // Clone into the specific cacheDir

   // Now that it's cloned, set the baseDir correctly for subsequent commands
   options.baseDir = cacheDir;
   const repoGit = simpleGit(options);

   // If a specific ref (branch, tag, commit) was specified, check it out
   if (repoRef) {
     await repoGit.checkout(repoRef);
   }

   return cacheDir;
}

/**
 * Helper to get the default branch name (heuristically checks common names).
 */
async function getDefaultBranch(git) {
   try {
     const remoteInfo = await git.remote(['show', 'origin']);
     const match = remoteInfo?.match(/HEAD branch:\s+(\S+)/);
     if (match && match[1]) {
        return match[1];
     }
   } catch (e) {
   }
   // Fallback heuristic
   const branches = await git.branchLocal();
   if (branches.all.includes('main')) return 'main';
   if (branches.all.includes('master')) return 'master';
   // If neither found, maybe it's the only branch? Or throw error?
   if (branches.all.length > 0) return branches.all[0];
   throw new Error("Could not determine the default branch of the repository.");
}

/**
 * Helper to check if a ref is a known local or remote branch.
 */
async function isBranch(git, ref) {
    try {
        const branches = await git.branch();
        return branches.all.includes(ref) || branches.all.includes(`remotes/origin/${ref}`);
    } catch (e) {
        return false; // Assume not a branch on error
    }
}

/**
 * Heuristic check if a ref name looks like a branch name (not foolproof).
 * Avoids trying to --branch clone a commit hash or tag.
 */
async function isLikelyBranchName(ref) {
    // Very basic check: does not contain typical tag/commit patterns like '/' or only hex chars
    return !ref.includes('/') && !/^[0-9a-f]{7,}$/i.test(ref);
}

// Ensure fs-extra is installed: npm install fs-extra @types/fs-extra --save
// Ensure simple-git is installed: npm install simple-git --save