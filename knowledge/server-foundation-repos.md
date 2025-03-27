The `/workspace` folder contains repositories downloaded from GitHub.

- They are forks of repositories from organizations like `stolostron`, `open-cluster-management-io`, and `openshift`.

---

The default branch of these repositories is usually the `main` branch, but some repositories have `master` as their default branch.

For repositories forked from `stolostron`, in addition to the `main` branch, there are branches for previous releases following the naming pattern `backplane-2.x`.

The currently active `stolostron` release branches range from `backplane-2.4` to `backplane-2.9`.

---

When we mentioned the "server-foundation-repos", it means the repos in the table below.

| Repository                       |
| -------------------------------- |
| ocm                              |
| managedcluster-import-controller |
| multicloud-operators-foundation  |
| cluster-proxy                    |
| cluster-proxy-addon              |
| managed-serviceaccount           |
| clusterlifecycle-state-metrics   |
| klusterlet-addon-controller      |

---

The `ocm`, `cluster-proxy`, `managed-serviceaccount` repos' upstream is `open-cluster-management-io`.

The `cluster-proxy` and `cluster-proxy-addon` are 2 different repos, please don't mix them up.

---

The repositories have nicknames that can be used in task descriptions to refer to them. The nicknames table is as follows:

| Repository                       | Nickname          |
| -------------------------------- | ----------------- |
| managedcluster-import-controller | import-controller |
| multicloud-operators-foundation  | foundation        |
| managed-serviceaccount           | msa               |
