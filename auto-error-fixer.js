// Auto Error Fix API Endpoint
// This would be added to your backend server

const express = require('express');
const fs = require('fs');
const path = require('path');

class AutoErrorFixer {
    constructor() {
        this.errorHistory = [];
        this.fixPatterns = {
            'undefined_property': this.fixUndefinedPropertyError,
            'missing_export': this.fixMissingExportError,
            'syntax_error': this.fixSyntaxError,
            'type_error': this.fixTypeError,
            'reference_error': this.fixReferenceError
        };
    }

    // API endpoint to receive error reports
    setupRoutes(app) {
        app.post('/api/error-report', (req, res) => {
            const { errorType, data, timestamp, url, userAgent } = req.body;

            console.log(`🚨 Error reported: ${errorType} at ${timestamp}`);
            console.log(`URL: ${url}`);
            console.log(`Data:`, data);

            // Store error in history
            this.errorHistory.push({
                errorType,
                data,
                timestamp,
                url,
                userAgent
            });

            // Attempt to fix the error
            const fixResult = this.attemptFix(errorType, data);

            res.json({
                success: true,
                fixApplied: fixResult.success,
                message: fixResult.message,
                suggestions: data.suggestions || []
            });
        });
    }

    attemptFix(errorType, data) {
        const fixer = this.fixPatterns[errorType];
        if (fixer) {
            return fixer(data);
        }
        return { success: false, message: 'No fixer available for this error type' };
    }

    fixUndefinedPropertyError(data) {
        const { property, errorMessage } = data;

        // Find files that might contain this error
        const srcDir = path.join(__dirname, 'src');
        const files = this.findFiles(srcDir, ['.tsx', '.ts', '.jsx', '.js']);

        let fixesApplied = 0;

        files.forEach(file => {
            try {
                let content = fs.readFileSync(file, 'utf8');
                let modified = false;

                // Apply various fix patterns
                const patterns = [
                    // Fix direct property access
                    new RegExp(`(\\w+)\\.${property}([^?])`, 'g'),
                    // Fix in object destructuring
                    new RegExp(`\\{([^}]*)\\s*${property}\\s*([^}]*)\\}`, 'g'),
                    // Fix in function calls
                    new RegExp(`(\\w+)\\.${property}\\(`, 'g')
                ];

                patterns.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        content = content.replace(pattern, (match, obj, suffix) => {
                            modified = true;
                            if (suffix === '') {
                                return `${obj}?.${property}`;
                            } else {
                                return `${obj}?.${property}${suffix}`;
                            }
                        });
                    }
                });

                if (modified) {
                    fs.writeFileSync(file, content);
                    fixesApplied++;
                    console.log(`✅ Fixed undefined property access in ${file}`);
                }
            } catch (error) {
                console.error(`Error processing file ${file}:`, error);
            }
        });

        return {
            success: fixesApplied > 0,
            message: `Applied ${fixesApplied} fixes for undefined property '${property}'`
        };
    }

    fixMissingExportError(data) {
        const { errorMessage } = data;

        // Extract import information from error message
        const importMatch = errorMessage.match(/import.*from\s+['"]([^'"]+)['"]/);
        if (!importMatch) {
            return { success: false, message: 'Could not parse import statement' };
        }

        const importPath = importMatch[1];
        const srcDir = path.join(__dirname, 'src');

        // Find the target file
        const targetFile = this.findFileByImportPath(srcDir, importPath);
        if (!targetFile) {
            return { success: false, message: 'Could not find target file' };
        }

        // Check if the export exists
        const content = fs.readFileSync(targetFile, 'utf8');
        const exportMatch = errorMessage.match(/['"]([^'"]+)['"]\s+is not exported/);

        if (exportMatch) {
            const exportName = exportMatch[1];

            // Try to find the export and fix it
            if (!content.includes(`export ${exportName}`) && !content.includes(`export { ${exportName}`)) {
                // Add the missing export
                const newContent = content + `\nexport { ${exportName} };\n`;
                fs.writeFileSync(targetFile, newContent);

                return {
                    success: true,
                    message: `Added missing export '${exportName}' to ${targetFile}`
                };
            }
        }

        return { success: false, message: 'Could not determine missing export' };
    }

    fixSyntaxError(data) {
        const { errorMessage } = data;

        // Extract file and line information
        const fileMatch = errorMessage.match(/\(([^:]+):(\d+):(\d+)\)/);
        if (!fileMatch) {
            return { success: false, message: 'Could not parse file location' };
        }

        const [, filePath, lineNum, colNum] = fileMatch;
        const fullPath = path.join(__dirname, filePath);

        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            const lineIndex = parseInt(lineNum) - 1;

            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];

                // Apply common syntax fixes
                let fixedLine = line;

                // Fix missing parentheses
                if (errorMessage.includes('Expected ")" but found')) {
                    fixedLine = line.replace(/(\w+)\(_\(/g, '$1((');
                    fixedLine = fixedLine.replace(/(\w+)\.map\(_\(/g, '$1.map((');
                    fixedLine = fixedLine.replace(/(\w+)\.filter\(_\(/g, '$1.filter((');
                    fixedLine = fixedLine.replace(/(\w+)\.sort\(_\(/g, '$1.sort((');
                }

                if (fixedLine !== line) {
                    lines[lineIndex] = fixedLine;
                    fs.writeFileSync(fullPath, lines.join('\n'));

                    return {
                        success: true,
                        message: `Fixed syntax error in ${filePath} at line ${lineNum}`
                    };
                }
            }
        } catch (error) {
            console.error(`Error fixing syntax error in ${fullPath}:`, error);
        }

        return { success: false, message: 'Could not fix syntax error' };
    }

    fixTypeError(data) {
        // Similar to undefined property but for method calls
        return this.fixUndefinedPropertyError(data);
    }

    fixReferenceError(data) {
        const { errorMessage } = data;

        // Extract variable name from error message
        const varMatch = errorMessage.match(/ReferenceError:\s+(\w+)\s+is not defined/);
        if (!varMatch) {
            return { success: false, message: 'Could not parse variable name' };
        }

        const varName = varMatch[1];
        const srcDir = path.join(__dirname, 'src');
        const files = this.findFiles(srcDir, ['.tsx', '.ts', '.jsx', '.js']);

        let fixesApplied = 0;

        files.forEach(file => {
            try {
                let content = fs.readFileSync(file, 'utf8');

                // Look for usage of undefined variable and add underscore prefix
                const pattern = new RegExp(`\\b${varName}\\b(?!\\s*[=:])`, 'g');
                const matches = content.match(pattern);

                if (matches) {
                    content = content.replace(pattern, `_${varName}`);
                    fs.writeFileSync(file, content);
                    fixesApplied++;
                    console.log(`✅ Fixed reference error for '${varName}' in ${file}`);
                }
            } catch (error) {
                console.error(`Error processing file ${file}:`, error);
            }
        });

        return {
            success: fixesApplied > 0,
            message: `Applied ${fixesApplied} fixes for undefined variable '${varName}'`
        };
    }

    findFiles(dir, extensions) {
        const files = [];

        const walkDir = (currentDir) => {
            const items = fs.readdirSync(currentDir);

            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    walkDir(fullPath);
                } else if (extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            });
        };

        walkDir(dir);
        return files;
    }

    findFileByImportPath(srcDir, importPath) {
        // Convert import path to file path
        const filePath = importPath.replace('@/', 'src/') + '.tsx';
        const fullPath = path.join(__dirname, filePath);

        if (fs.existsSync(fullPath)) {
            return fullPath;
        }

        // Try with .ts extension
        const tsPath = path.join(__dirname, filePath.replace('.tsx', '.ts'));
        if (fs.existsSync(tsPath)) {
            return tsPath;
        }

        return null;
    }
}

module.exports = AutoErrorFixer;