# HIDRAULICALC.

Calculadoras de ingeniería hidráulica con diseño inmersivo inspirado en Kudanil.

## 🚀 Características

### Diseño de Alto Impacto
- **Tipografía Hero**: Títulos gigantes con gradientes de texto
- **Glassmorphism**: Efecto cristal esmerilado en todas las cards
- **Animaciones Fluidas**: Framer Motion con springs y easing personalizado
- **Fondo Dinámico**: Partículas animadas y gradientes reactivos al mouse

### Calculadoras Disponibles
- **Embalse Cilíndrico**: Cálculo de volumen para tanques cilíndricos
- **Canal Rectangular**: Cálculo de volumen para canales rectangulares
- **Tanque Vertical**: Cálculo de volumen para tanques verticales
- **Graficador de Integrales**: Graficado y cálculo de integrales definidas

### Stack Tecnológico
- **Framework**: Next.js 15 App Router
- **Estilos**: Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Lenguaje**: TypeScript
- **Iconos**: Lucide React

## 📦 Instalación

### Requisitos Previos
- Node.js 20.x o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/DevCodeLone0/Hidraulicalc.git
cd Hidraulicalc
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Deep Black | `#0a0a0a` | Fondo principal |
| Charcoal | `#0f0f0f` | Superficies |
| Technical Cyan | `#00d4ff` | Acentos |
| Broken White | `#f5f5f5` | Texto |

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/
│   ├── layout/            # Componentes de layout
│   │   └── HeroSection.tsx
│   ├── calculators/       # Calculadoras
│   │   ├── CalculatorCard.tsx
│   │   ├── CalculatorGrid.tsx
│   │   ├── CylindricalReservoirCalculator.tsx
│   │   ├── RectangularChannelCalculator.tsx
│   │   ├── VerticalTankCalculator.tsx
│   │   └── IntegralCalculator.tsx
│   └── effects/           # Efectos visuales
│       ├── ParticleBackground.tsx
│       └── DynamicGradient.tsx
├── hooks/                 # Custom React hooks
│   └── useCounter.ts
└── lib/                   # Utilidades
    └── utils.ts
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint
```

## 🌟 Características de Diseño

### 1. Tipografía Hero
- Títulos gigantes con `clamp(3rem, 8vw, 8rem)`
- Fuentes Inter y Montserrat
- Gradientes de texto personalizados

### 2. Glassmorphism
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### 3. Animaciones
- Contadores numéricos con easing cúbico
- Transiciones suaves con Framer Motion
- Efectos hover con transform

### 4. Fondo Dinámico
- Partículas animadas
- Gradiente reactivo al movimiento del mouse
- Smooth scroll con springs

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Hidraulicalc Team**

- GitHub: [@DevCodeLone0](https://github.com/DevCodeLone0)

## 🙏 Agradecimientos

- [Kudanil](https://kudanil.com) - Inspiración de diseño
- [Next.js](https://nextjs.org) - Framework React
- [Tailwind CSS](https://tailwindcss.com) - Estilos
- [Framer Motion](https://www.framer.com/motion/) - Animaciones
- [Lucide Icons](https://lucide.dev) - Iconos
