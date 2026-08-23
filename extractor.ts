import ts from 'typescript';
import fs from 'node:fs';

export function extractRoutePaths(filePath: string): string[] {
	const fileContent = fs.readFileSync(filePath, 'utf8');
	const sourceFile = ts.createSourceFile(filePath, fileContent,
		ts.ScriptTarget.Latest, true);

	const paths: string[] = [];

	function traverse(node: ts.Node) {
		// Look for object literals (e.g., { path: 'home', component: ... })
		if (ts.isObjectLiteralExpression(node)) {
			node.properties.forEach(prop => {
				// Look for the 'path' property
				if (ts.isPropertyAssignment(prop) &&
					ts.isIdentifier(prop.name) && prop.name.text === 'path') {
					// Extract the string value of the path
					if (ts.isStringLiteral(prop.initializer)) {
						paths.push(prop.initializer.text);
					}
				}
			});
		}
		ts.forEachChild(node, traverse);
	}

	traverse(sourceFile);
	return paths;
}
