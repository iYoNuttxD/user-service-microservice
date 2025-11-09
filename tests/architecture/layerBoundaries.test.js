import { describe, it, expect } from '@jest/globals';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcPath = join(__dirname, '../../src');

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

describe('Architecture Tests', () => {
  describe('Domain Layer Isolation', () => {
    it('should not import from infrastructure layer', () => {
      const domainFiles = getAllFiles(join(srcPath, 'domain'));
      
      domainFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Domain should not import from infra
        expect(content).not.toMatch(/from ['"].*\/infra\//);
        expect(content).not.toMatch(/require\(['"].*\/infra\//);
        
        // Domain should not import from features
        expect(content).not.toMatch(/from ['"].*\/features\//);
        expect(content).not.toMatch(/require\(['"].*\/features\//);
        
        // Domain should not import Express
        expect(content).not.toMatch(/from ['"]express['"]/);
        expect(content).not.toMatch(/require\(['"]express['"]/);
      });
    });
  });

  describe('Use Cases Isolation', () => {
    it('should only depend on domain and ports', () => {
      const useCasesPath = join(srcPath, 'features/users/application/usecases');
      const useCaseFiles = getAllFiles(useCasesPath);
      
      useCaseFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Use cases should not directly import infrastructure implementations
        expect(content).not.toMatch(/from ['"].*\/infra\/repositories\//);
        expect(content).not.toMatch(/from ['"].*\/infra\/db\//);
        expect(content).not.toMatch(/from ['"].*\/infra\/messaging\//);
        expect(content).not.toMatch(/from ['"].*\/infra\/crypto\//);
      });
    });
  });

  describe('HTTP Handlers', () => {
    it('should only depend on use cases', () => {
      const handlersPath = join(srcPath, 'features/users/http/handlers');
      const handlerFiles = getAllFiles(handlersPath);
      
      handlerFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Handlers should not import domain services directly
        expect(content).not.toMatch(/from ['"].*\/domain\/services\//);
        
        // Handlers should not import repositories directly
        expect(content).not.toMatch(/from ['"].*\/repositories\//);
      });
    });
  });

  describe('Infrastructure Layer', () => {
    it('should implement domain ports', () => {
      const repositoryFiles = getAllFiles(join(srcPath, 'infra/repositories'));
      
      repositoryFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Repositories should import from domain ports
        expect(content).toMatch(/from ['"].*\/domain\/ports\//);
      });
    });
  });
});
