import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  cpf: string;
  active: boolean;
  lastAttendance?: {
    type: string;
    timestamp: string;
    withinRadius: boolean;
  } | null;
}

export default function EmployeesList() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/dashboard/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de colaboradores.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (type?: string) => {
    if (!type) return '#999';
    if (type === 'ENTRY' || type === 'LUNCH_RETURN') return '#4CAF50'; // Green
    return '#F44336'; // Red
  };

  const getStatusText = (type?: string) => {
    if (!type) return 'Sem registro';
    if (type === 'ENTRY') return 'Trabalhando';
    if (type === 'LUNCH_START') return 'Almoço';
    if (type === 'LUNCH_RETURN') return 'Trabalhando';
    if (type === 'EXIT') return 'Saiu';
    return type;
  };

  const renderItem = ({ item }: { item: Employee }) => {
    const statusColor = item.active ? getStatusColor(item.lastAttendance?.type) : '#ccc';
    const statusText = item.active ? getStatusText(item.lastAttendance?.type) : 'Inativo';
    
    return (
      <TouchableOpacity style={[styles.card, !item.active && { opacity: 0.6 }]} onPress={() => router.push(`/manager/employee/${item.id}`)}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={40} color={statusColor} />
          {item.active && <View style={[styles.statusDot, { backgroundColor: statusColor }]} />}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.name} {!item.active && '(Inativo)'}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            {item.active && item.lastAttendance && (
               <Text style={styles.lastUpdate}> • {new Date(item.lastAttendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Colaboradores</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum colaborador encontrado.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  role: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
});
