# Guía de Instalación - HIDRAULICALC.

## Requisitos Previos

### 1. Node.js (Versión 20.x o superior)

#### Windows/macOS:
1. Visita [https://nodejs.org](https://nodejs.org)
2. Descarga la versión LTS (Long Term Support)
3. Ejecuta el instalador y sigue las instrucciones

#### Linux (Ubuntu/Debian):
```bash
# Usando NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### Linux (Fedora/RHEL):
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

## Instalación del Proyecto

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/DevCodeLone0/Hidraulicalc.git
cd Hidraulicalc
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

Esto instalará:
- Next.js 15
- React 19
- Tailwind CSS 4
- Framer Motion
- Lucide React (iconos)
- Math.js (cálculos matemáticos)
- Function-plot (graficador)

### Paso 3: Ejecutar en Modo Desarrollo
```bash
npm run dev
```

La aplicación se ejecutará en: **http://localhost:3000**

## Estructura del Proyecto

```
hidraulicalc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página de inicio
│   │   └── globals.css         # Estilos globales
│   ├── components/
│   │   ├── layout/             # Componentes de layout
│   │   ├── calculators/        # Calculadoras
│   │   └── effects/            # Efectos visuales
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilidades
├── public/                     # Archivos estáticos
├── package.json                # Dependencias
├── tailwind.config.ts          # Configuración Tailwind
└── tsconfig.json               # Configuración TypeScript
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Compila para producción
npm run start            # Inicia servidor de producción

# Utilidades
npm run lint             # Ejecuta ESLint
```

## Verificación de Instalación

### 1. Verificar Node.js
```bash
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x o superior
```

### 2. Verificar Dependencias
```bash
npm list --depth=0
```

Debe incluir:
- next@15.0.0
- react@19.0.0
- framer-motion@11.0.0
- tailwindcss@4.0.0

### 3. Verificar Servidor de Desarrollo
1. Ejecuta `npm run dev`
2. Abre http://localhost:3000
3. Deberías ver la página de inicio con el hero "HIDRAULICALC."

## Solución de Problemas

### Error: "Module not found"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Opción 1: Matar el proceso
kill $(lsof -t -i:3000)

# Opción 2: Usar otro puerto
PORT=3001 npm run dev
```

### Error: "Cannot find module '@/components/...'"
Verifica que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Características Implementadas

### 1. Diseño Kudanil-Inspirado
- ✅ Fondo negro profundo (#0a0a0a)
- ✅ Gradientes dinámicos reactivos al mouse
- ✅ Partículas animadas en el fondo
- ✅ Glassmorphism en todas las cards

### 2. Tipografía Hero
- ✅ "HIDRAULICALC." en tamaño gigante
- ✅ Fuentes Inter y Montserrat
- ✅ Gradiente de texto personalizado

### 3. Animaciones
- ✅ Framer Motion para todas las animaciones
- ✅ Contadores numéricos con easing cúbico
- ✅ Transiciones suaves en hover
- ✅ Scroll animations con springs

### 4. Calculadoras
- ✅ Embalse Cilíndrico
- ✅ Canal Rectangular
- ✅ Tanque Vertical
- ✅ Graficador de Integrales

## Próximos Pasos

1. **Implementar graficador de integrales** con function-plot
2. **Añadir más ejemplos** de funciones
3. **Agregar historial de cálculos**
4. **Implementar modo oscuro/claro**
5. **Añadir exportación de resultados** a PDF

## Soporte

Si encuentras problemas:
1. Revisa este README
2. Abre un issue en GitHub
3. Verifica la consola del navegador para errores

## Enlaces Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React](https://react.dev)
