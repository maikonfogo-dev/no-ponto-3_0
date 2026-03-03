import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';
import { Ionicons } from '@expo/vector-icons';

interface UserDetail {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;
  active: boolean;
  allowedRadiusMeters: number | null;
  company: {
    allowedRadiusMeters: number;
  };
}

export default function EmployeeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [active, setActive] = useState(true);
  const [useCustomRadius, setUseCustomRadius] = useState(false);
  const [radius, setRadius] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const userData = response.data;
      setUser(userData);
      setActive(userData.active);
      if (userData.allowedRadiusMeters !== null) {
        setUseCustomRadius(true);
        setRadius(userData.allowedRadiusMeters.toString());
      } else {
        setUseCustomRadius(false);
        setRadius(userData.company.allowedRadiusMeters.toString());
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do colaborador.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (useCustomRadius && (!radius || isNaN(parseFloat(radius)))) {
      Alert.alert('Erro', 'Por favor, insira um raio válido.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        active,
        allowedRadiusMeters: useCustomRadius ? parseFloat(radius) : null,
      };

      await api.patch(`/users/${id}`, payload);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar dados.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Colaborador</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.cpf}>CPF: {user.cpf}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status da Conta</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Ativo</Text>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={active ? '#007bff' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.hint}>
            {active ? 'O colaborador pode acessar o aplicativo.' : 'O acesso do colaborador está bloqueado.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geolocalização</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Raio Personalizado</Text>
            <Switch
              value={useCustomRadius}
              onValueChange={setUseCustomRadius}
            />
          </View>
          
          {useCustomRadius ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Raio Permitido (metros)</Text>
              <TextInput
                style={styles.input}
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
                placeholder="Ex: 100"
              />
            </View>
          ) : (
            <Text style={styles.info}>
              Usando raio padrão da empresa: {user.company.allowedRadiusMeters} metros.
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  cpf: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
