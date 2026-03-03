import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface DashboardStats {
  totalEmployees: number;
  pendingAdjustments: number;
  incompleteRecords: number;
}

export default function ManagerHome() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Painel do Gestor</Text>
        <Text style={styles.userName}>{user?.name}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Colaboradores</Text>
            <Text style={styles.cardValue}>{stats?.totalEmployees || 0}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.cardTitle}>Ajustes Pendentes</Text>
            <Text style={[styles.cardValue, { color: '#FF9800' }]}>{stats?.pendingAdjustments || 0}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.cardTitle}>Pontos Incompletos</Text>
            <Text style={[styles.cardValue, { color: '#F44336' }]}>{stats?.incompleteRecords || 0}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/manager/employees')}>
          <Text style={styles.actionText}>👥 Gestão de Colaboradores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/manager/adjustments')}>
          <Text style={styles.actionText}>📝 Aprovação de Ajustes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Mapa')}>
          <Text style={styles.actionText}>📍 Mapa em Tempo Real</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
