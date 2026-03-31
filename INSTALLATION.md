# 🚀 Quick Start - HIDRAULICALC

## Instalación Rápida (3 Pasos)

### 1️⃣ Instalar Node.js
```bash
# Windows/macOS: Descargar desde https://nodejs.org
# Linux Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version  # Debe ser v20.x
npm --version   # Debe ser 10.x+
```

### 2️⃣ Instalar Dependencias
```bash
cd Hidraulicalc
npm install
```

### 3️⃣ Ejecutar
```bash
npm run dev
```

Abre **http://localhost:3000** en tu navegador.

---

## ✅ Verificación

Después de instalar, deberías ver:

1. ✅ Hero section con "HIDRAULICALC." en grande
2. ✅ Fondo negro con partículas animadas
3. ✅ Gradiente que sigue el mouse
4. ✅ 4 calculadoras con efecto glassmorphism
5. ✅ Inputs con focus cyan

---

## 🆘 Problemas Comunes

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 in use"
```bash
# Linux/macOS
kill $(lsof -t -i:3000)
npm run dev

# Windows
# Cerrar proceso en puerto 3000 o usar otro puerto
PORT=3001 npm run dev
```

### Error: "Cannot find module '@/*'"
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

---

## 📚 Más Información

- **README.md** - Documentación completa
- **SETUP.md** - Guía detallada de instalación
- **PROJECT_SUMMARY.md** - Resumen técnico

---

## 🎯 Features Implementadas

- ✅ Next.js 15 App Router
- ✅ Tailwind CSS 4
- ✅ Framer Motion animations
- ✅ TypeScript strict mode
- ✅ Glassmorphism design
- ✅ Animated counters
- ✅ Particle background
- ✅ Mouse-reactive gradient
- ✅ 4 hydraulic calculators
- ✅ Responsive design

---

**Hecho con ❤️ para ingeniería hidráulica de precisión**
