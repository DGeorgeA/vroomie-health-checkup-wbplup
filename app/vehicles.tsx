
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { colors } from '@/styles/commonStyles';
import { mockVehicles } from '@/data/mockData';

export default function VehiclesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181b', '#27272a', '#18181b']}
        style={styles.gradient}
      >
        <TopNavigation />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Your Vehicles</Text>
          <Text style={styles.subtitle}>Manage your vehicle fleet</Text>

          <View style={styles.vehiclesList}>
            {mockVehicles.map((vehicle, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  onPress={() => router.push(`/vehicles/${vehicle.id}` as any)}
                >
                  <BlurView intensity={20} style={styles.vehicleCard}>
                    <View style={styles.vehicleContent}>
                      <View style={styles.vehicleIcon}>
                        <IconSymbol
                          ios_icon_name="car.fill"
                          android_material_icon_name="directions-car"
                          size={32}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleName}>
                          {vehicle.make} {vehicle.model}
                        </Text>
                        <Text style={styles.vehicleDetails}>
                          {vehicle.year} • {vehicle.registration_number}
                        </Text>
                      </View>
                      <IconSymbol
                        ios_icon_name="chevron.right"
                        android_material_icon_name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton}>
            <BlurView intensity={20} style={styles.addButtonBlur}>
              <View style={styles.addButtonContent}>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.addButtonText}>Add New Vehicle</Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 80 : 0,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  vehiclesList: {
    gap: 12,
    marginBottom: 24,
  },
  vehicleCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
