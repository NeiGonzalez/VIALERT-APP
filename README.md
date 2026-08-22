# ViAlert-APP

MVP para reportar incendios y accidentes con ubicación GPS, asistencia por voz, captura de evidencia y funcionamiento con conectividad limitada.

## URL de publicación

Repositorio: `VIALERT-APP`  
GitHub Pages: `https://neigonzalez.github.io/VIALERT-APP/`

## Desarrollo local

```bash
npm install
npm run dev
```

## Compilación

```bash
npm run build
```

La configuración de Vite usa `base: '/VIALERT-APP/'` para que todos los recursos se resuelvan dentro de la URL del repositorio y nunca contra la raíz del portfolio.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica automáticamente desde la rama `main` mediante GitHub Actions oficiales.

En GitHub, configurar **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Navegación

ViAlert-APP usa `HashRouter`, por lo que login, logout, Home, reportes y panel permanecen dentro de `/VIALERT-APP/` en GitHub Pages.

## Voz

La app selecciona automáticamente una voz en español latino disponible en el navegador/sistema, priorizando variantes latinoamericanas y voces masculinas cuando el motor de voz las identifica por nombre. No expone selector de voz al usuario.

## Nota de seguridad del MVP

El repositorio no requiere claves API, tokens ni credenciales privadas. Los códigos de acceso de bomberos/policía forman parte de la demo cliente y no constituyen autenticación segura para producción. Una versión productiva requeriría autenticación y autorización del lado servidor.
