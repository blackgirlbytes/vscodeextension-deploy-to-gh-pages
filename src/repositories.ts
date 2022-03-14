import { Octokit } from '@octokit/rest';
import * as vscode from 'vscode';

export class Repositories {
    async getRepoList(userInfo: any, octokit: Octokit) {
        let repoList;
        try {
            repoList = await octokit.repos.listForUser({ username: userInfo.data.login, sort: 'created' });
            return repoList

        } catch (err) {
            console.log(err)
        }
        return repoList
    }
    async postToGitHubPages(repo: any, branch: any, userInfo: any, octokit: Octokit) {
        let message: string = 'Unable to post on GitHub Pages'
        try {

            const result = await octokit.repos.createPagesSite({
                owner: userInfo.data.login,
                repo: repo,
                source: {
                    branch: branch,
                    path: '/'
                }
            })
            if (result) {
                if (result.status === 201) {
                    message = `Your GitHub Page will be available in a few minutes on: https://${userInfo.data.login}.github.io/${repo}/`
                }
            }
        } catch (err: any) {
            message = err.message
        } finally {
            vscode.window.showInformationMessage(message);
        }
    }
    async handleQuickPickList(userInfo: any, octokit: Octokit) {
        const repoList = await this.getRepoList(userInfo, octokit)
        try {
            if (repoList) {
                // add a theme icon to quick pick item 
                let items: vscode.QuickPickItem[] = repoList.data.map(({ full_name, name, default_branch }) => ({
                    label: `$(repo) Host on GitHub Pages: ${full_name}`,
                    description: name,
                    detail: default_branch,
                }));

                vscode.window.showQuickPick(items).then(selection => {
                    // the user canceled the selection
                    if (!selection) {
                        return;
                    }
                    vscode.window
                        .showInformationMessage(`Publish ${selection.description} on branch ${selection.detail} to GitHub Pages`, "Publish")
                        .then(answer => {
                            if (answer === `Publish`) {
                                this.postToGitHubPages(selection.description, selection.detail, userInfo, octokit);
                            }
                        })
                })
            }
        } catch (err) {
            console.log(err)
        }

    }
}
