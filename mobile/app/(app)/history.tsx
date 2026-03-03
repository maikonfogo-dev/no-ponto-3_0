import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AttendanceRecord {
  id: number;
  type: string;
  timestamp: string;
  withinRadius: boolean;
}

export default function History() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/attendance');
      setRecords(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const formatType = (type: string) => {
    return type.replace('_', ' ');
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.type}>{formatType(item.type)}</Text>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={item.withinRadius ? styles.radiusOk : styles.radiusWarn}>
        {item.withinRadius ? '✅ Dentro do Raio' : '⚠️ Fora do Raio'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Pontos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum registro encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  type: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  date: {
    color: '#666',
  },
  radiusOk: {
    color: 'green',
    fontWeight: '500',
  },
  radiusWarn: {
    color: 'red',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
});
