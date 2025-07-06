/**
 * Script de Validación de Rutas
 * 
 * Este script verifica que todas las rutas referenciadas en la aplicación
 * existan como archivos page.tsx en el sistema de archivos.
 */

const path = require('path');
const fs = require('fs');

// Rutas que deben existir en la aplicación
const requiredRoutes = [
  // Rutas principales
  '/user',
  '/user/profile',
  
  // Rutas de comunidades
  '/user/communities',
  '/user/communities/create',
  '/user/communities/explore',
  '/user/communities/[id]',
  
  // Rutas de votaciones
  '/user/voting',
  '/user/voting/create',
  '/user/voting/[id]',
  
  // Rutas de admin (si existen)
  '/admin',
];

// Enlaces encontrados en componentes que deben ser válidos
const componentLinks = [
  '/user/voting/create',
  '/user/communities/explore',
  '/user/communities/create',
  '/user/profile',
  '/user',
  '/user/communities',
  '/user/voting',
];

const appDir = path.join(__dirname, '../src/app');

function checkRouteExists(route) {
  // Convertir ruta a path del sistema de archivos
  let filePath;
  
  if (route === '/') {
    filePath = path.join(appDir, 'page.tsx');
  } else if (route.includes('[id]')) {
    // Dynamic route
    const routeParts = route.split('/').filter(Boolean);
    const dynamicPath = routeParts.join('/');
    filePath = path.join(appDir, dynamicPath, 'page.tsx');
  } else {
    const routeParts = route.split('/').filter(Boolean);
    filePath = path.join(appDir, ...routeParts, 'page.tsx');
  }
  
  return fs.existsSync(filePath);
}

function validateRoutes() {
  console.log('🔍 Validando rutas de la aplicación...\n');
  
  const results = {
    valid: [],
    invalid: [],
    total: 0
  };
  
  // Combinar todas las rutas para validar
  const allRoutes = [...new Set([...requiredRoutes, ...componentLinks])];
  
  allRoutes.forEach(route => {
    const exists = checkRouteExists(route);
    results.total++;
    
    if (exists) {
      results.valid.push(route);
      console.log(`✅ ${route}`);
    } else {
      results.invalid.push(route);
      console.log(`❌ ${route} - ARCHIVO NO ENCONTRADO`);
    }
  });
  
  console.log('\n📊 RESUMEN DE VALIDACIÓN:');
  console.log(`Total rutas verificadas: ${results.total}`);
  console.log(`✅ Válidas: ${results.valid.length}`);
  console.log(`❌ Inválidas: ${results.invalid.length}`);
  
  if (results.invalid.length > 0) {
    console.log('\n🚨 RUTAS FALTANTES:');
    results.invalid.forEach(route => {
      console.log(`   - ${route}`);
    });
    
    console.log('\n💡 ACCIONES REQUERIDAS:');
    results.invalid.forEach(route => {
      let filePath;
      if (route.includes('[id]')) {
        const routeParts = route.split('/').filter(Boolean);
        filePath = `src/app/${routeParts.join('/')}/page.tsx`;
      } else {
        const routeParts = route.split('/').filter(Boolean);
        filePath = `src/app/${routeParts.join('/')}/page.tsx`;
      }
      console.log(`   - Crear: ${filePath}`);
    });
  } else {
    console.log('\n🎉 ¡Todas las rutas están correctamente implementadas!');
  }
  
  return results;
}

// Función para validar enlaces en componentes específicos
function validateComponentLinks() {
  console.log('\n🔗 Validando enlaces en componentes...\n');
  
  const componentsToCheck = [
    '../src/components/user/ActiveVotings.tsx',
    '../src/components/user/MyCommunities.tsx',
    '../src/app/user/page.tsx',
    '../src/app/user/profile/page.tsx',
    '../src/app/user/layout.tsx'
  ];
  
  componentsToCheck.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Buscar enlaces href="/user/*"
      const hrefMatches = content.match(/href="\/user[^"]*"/g);
      if (hrefMatches) {
        console.log(`📄 ${path.basename(componentPath)}:`);
        hrefMatches.forEach(match => {
          const route = match.replace('href="', '').replace('"', '');
          const exists = checkRouteExists(route);
          console.log(`   ${exists ? '✅' : '❌'} ${route}`);
        });
        console.log();
      }
    }
  });
}

// Ejecutar validaciones
if (require.main === module) {
  validateRoutes();
  validateComponentLinks();
}

module.exports = { validateRoutes, checkRouteExists };
