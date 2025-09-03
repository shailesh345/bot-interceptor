import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Check,
  Settings,
  Eye,
  EyeOff,
  Contrast,
  Zap
} from 'lucide-react';

const ThemeSwitcher = ({ onThemeChange, className = '' }) => {
  const [currentTheme, setCurrentTheme] = useState('system');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827'
  });

  // Available themes
  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean white background with dark text',
      icon: Sun,
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        border: '#E5E7EB'
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Dark background with light text',
      icon: Moon,
      colors: {
        primary: '#60A5FA',
        secondary: '#34D399',
        accent: '#FBBF24',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        border: '#374151'
      }
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: 'var(--system-bg)',
        surface: 'var(--system-surface)',
        text: 'var(--system-text)',
        border: 'var(--system-border)'
      }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Maximum contrast for accessibility',
      icon: Contrast,
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#FFFF00',
        background: '#FFFFFF',
        surface: '#F0F0F0',
        text: '#000000',
        border: '#000000'
      }
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Your personalized color scheme',
      icon: Palette,
      colors: customColors
    }
  ];

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Apply theme to document and CSS variables
  const applyTheme = useCallback((themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Set CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });

    // Apply theme-specific classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    if (themeId !== 'system') {
      document.documentElement.classList.add(`theme-${themeId}`);
    }

    // Handle system theme
    if (themeId === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(`theme-${systemTheme}`);
    }

    // Notify parent component
    onThemeChange?.(themeId, theme);
  }, [themes, onThemeChange]);

  // Handle theme change
  const handleThemeChange = useCallback((themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('theme', themeId);
    applyTheme(themeId);
  }, [applyTheme]);

  // Handle system theme change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme, applyTheme]);

  // Handle custom color change
  const handleCustomColorChange = useCallback((colorKey, value) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  }, []);

  // Apply custom colors
  const applyCustomColors = useCallback(() => {
    if (currentTheme === 'custom') {
      Object.entries(customColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [currentTheme, customColors]);

  // Apply custom colors when they change
  useEffect(() => {
    applyCustomColors();
  }, [applyCustomColors]);

  // Get current theme object
  const getCurrentTheme = useCallback(() => {
    return themes.find(t => t.id === currentTheme) || themes[0];
  }, [currentTheme, themes]);

  // Preview theme
  const previewTheme = useCallback((themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Temporarily apply theme
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}-preview`, value);
    });
  }, [themes]);

  // Clear preview
  const clearPreview = useCallback(() => {
    // Remove preview variables
    ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'border'].forEach(key => {
      document.documentElement.style.removeProperty(`--color-${key}-preview`);
    });
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main Theme Button */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
        title="Change Theme"
      >
        {React.createElement(getCurrentTheme().icon, { 
          className: 'w-5 h-5 text-gray-600 group-hover:text-black' 
        })}
        <span className="text-sm font-medium text-gray-600 group-hover:text-black">
          {getCurrentTheme().name}
        </span>
        <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      </button>

      {/* Advanced Theme Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-black">Theme Settings</h3>
              <p className="text-sm text-gray-600">Customize your application appearance</p>
            </div>

            {/* Theme Options */}
            <div className="p-4 space-y-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    currentTheme === theme.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleThemeChange(theme.id)}
                  onMouseEnter={() => previewTheme(theme.id)}
                  onMouseLeave={clearPreview}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      currentTheme === theme.id ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {React.createElement(theme.icon, { className: 'w-4 h-4' })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{theme.name}</h4>
                      <p className={`text-xs ${
                        currentTheme === theme.id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {theme.description}
                      </p>
                    </div>
                    {currentTheme === theme.id && (
                      <Check className="w-5 h-5" />
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="mt-3 flex space-x-2">
                    {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={`${key}: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Color Editor */}
            {currentTheme === 'custom' && (
              <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Colors</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(customColors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                        {key}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="w-8 h-8 rounded border-2 border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border-2 border-gray-200 rounded focus:border-black focus:outline-none"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 border-t-2 border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                    handleThemeChange(randomTheme.id);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  <Zap className="w-4 h-4" />
                  <span>Random Theme</span>
                </button>
                
                <button
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('theme-dark');
                    handleThemeChange(isDark ? 'light' : 'dark');
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  {document.documentElement.classList.contains('theme-dark') ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  <span>Toggle</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
