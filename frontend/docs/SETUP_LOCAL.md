# SETUP_LOCAL - Farmahumana / FHEC frontend real

Esta guia es para correr localmente el prototipo aprobado de Farmahumana / FHEC. La carpeta correcta es `frontend real`.

No trabajes en `frontend`; esa carpeta fue creada para pruebas temporales.

## 1. Herramientas necesarias

Instalar o tener disponible:

- Node.js LTS moderno.
- npm.
- Corepack.
- pnpm.
- Git.

Version probada en esta computadora:

- Node.js v22.23.1.
- npm 10.9.8.
- pnpm 11.10.0.
- Git 2.55.0.

Vite global no es necesario. El proyecto usa Vite local desde `node_modules`.

## 2. Instalar Node.js recomendado

En macOS con Homebrew:

```bash
brew install node@22
```

Verifica:

```bash
node -v
npm -v
corepack --version
```

Si `node` no queda reconocido despues de instalar con Homebrew, abre una terminal nueva. Si sigue sin reconocerse, revisa el enlace de Homebrew:

```bash
brew link --overwrite --force node@22
```

Alternativa: instalar la version LTS desde el instalador oficial de Node.js.

## 3. Activar pnpm con Corepack

```bash
corepack enable
pnpm -v
```

Si `pnpm` no se reconoce:

```bash
corepack prepare pnpm@11.10.0 --activate
pnpm -v
```

Si Corepack no existe, normalmente significa que Node.js no esta instalado correctamente o es una version muy vieja.

## 4. Entrar a la carpeta correcta

Desde la raiz del repositorio:

```bash
cd "frontend real"
```

Ruta completa usada en esta maquina:

```bash
cd "/Users/gagp/Documents/IDS/FHEC/frontend real"
```

No uses:

```bash
cd frontend
```

`frontend` es la carpeta temporal de pruebas.

## 5. Instalar dependencias

Dentro de `frontend real`:

```bash
pnpm install
```

El proyecto usa:

- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- Vite 6.3.5
- React 18.3.1
- React DOM 18.3.1

Si aparece un error de builds bloqueados de `esbuild` o `@tailwindcss/oxide`, revisa que `pnpm-workspace.yaml` contenga:

```yaml
allowBuilds:
  '@tailwindcss/oxide': true
  esbuild: true
```

Luego ejecuta de nuevo:

```bash
pnpm install
```

## 6. Correr el proyecto

Dentro de `frontend real`:

```bash
pnpm dev --host 127.0.0.1
```

URL esperada:

```text
http://127.0.0.1:5173/
```

Tambien puede funcionar:

```bash
pnpm dev
```

Si el puerto 5173 esta ocupado, Vite puede sugerir otro puerto.

## 7. Compilar el proyecto

Dentro de `frontend real`:

```bash
pnpm build
```

La salida de produccion queda en:

```text
dist/
```

`dist/` esta ignorado por Git y no debe versionarse.

## 8. Error: pnpm no reconocido

Prueba:

```bash
corepack enable
corepack prepare pnpm@11.10.0 --activate
pnpm -v
```

Si falla por permisos al crear enlaces en `/usr/local/bin`, ejecuta la terminal con permisos adecuados o reinstala Node.js LTS usando Homebrew.

## 9. Error: Node.js no instalado

Si `node -v` responde `command not found`, instala Node.js LTS:

```bash
brew install node@22
```

Luego abre una terminal nueva y verifica:

```bash
node -v
npm -v
corepack --version
```

## 10. Notas importantes del repositorio

- `frontend real` es la aplicacion visual aprobada y el foco de trabajo.
- `frontend` es temporal y no debe usarse para estas fases.
- `backend` sera manejado por otro equipo en esta fase.
- No cambies UI, estilos, layout, textos visibles ni assets cuando solo estes preparando entorno o diagnosticando.
- No borres archivos generados por Figma Make aunque parezcan duplicados; primero hay que mapear su uso.
