
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', route: '/' },
    { label: 'Health CheckUp', route: '/health-checkup' },
    { label: 'Reports', route: '/reports' },
  ];

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/(tabs)/(home)/' || pathname === '/(tabs)/(home)';
    }
    return pathname.includes(route);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <BlurView intensity={30} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>Vroomie</Text>
          
          {/* Desktop Navigation */}
          <View style={styles.desktopNav}>
            {navItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  onPress={() => router.push(item.route as any)}
                  style={[
                    styles.navItem,
                    isActive(item.route) && styles.navItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.navText,
                      isActive(item.route) && styles.navTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {/* Mobile Hamburger */}
          <TouchableOpacity
            style={styles.hamburger}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <IconSymbol
              ios_icon_name={menuOpen ? 'xmark' : 'line.3.horizontal'}
              android_material_icon_name={menuOpen ? 'close' : 'menu'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Mobile Menu */}
        {menuOpen && (
          <BlurView intensity={40} style={styles.mobileMenu}>
            {navItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  onPress={() => {
                    router.push(item.route as any);
                    setMenuOpen(false);
                  }}
                  style={[
                    styles.mobileNavItem,
                    isActive(item.route) && styles.mobileNavItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mobileNavText,
                      isActive(item.route) && styles.navTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </BlurView>
        )}
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.2)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  desktopNav: {
    flexDirection: 'row',
    gap: 8,
    display: Platform.select({ web: 'flex', default: 'none' }) as any,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  navTextActive: {
    color: colors.primary,
  },
  hamburger: {
    padding: 8,
    display: Platform.select({ web: 'none', default: 'flex' }) as any,
  },
  mobileMenu: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.2)',
    paddingVertical: 8,
  },
  mobileNavItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  mobileNavItemActive: {
    borderLeftColor: colors.primary,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
  },
  mobileNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
