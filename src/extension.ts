// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Credentials } from './credentials';
import { Repositories } from './repositories';

export async function activate(context: vscode.ExtensionContext) {
	const credentials = new Credentials();
	const repositories = new Repositories();
	await credentials.initialize(context);
	
	const disposable = vscode.commands.registerCommand('extension.deployToGitHubPages', async () => {
		const octokit = await credentials.getOctokit();
		const userInfo = await octokit.users.getAuthenticated();
		const quickPickList = await repositories.handleQuickPickList(userInfo, octokit)
	});

	context.subscriptions.push(disposable);
}