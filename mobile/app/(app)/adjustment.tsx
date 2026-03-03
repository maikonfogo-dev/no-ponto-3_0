import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { api } from '../../services/api';
import { useRouter } from 'expo-router';

export default function Adjustment() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/adjustments', {
        referenceDate: date,
        reason,
        description,
      });
      Alert.alert('Sucesso', 'Solicitação enviada!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitar Ajuste</Text>

      <Text style={styles.label}>Data do Ocorrido (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2023-01-01"
      />

      <Text style={styles.label}>Motivo (ex: Esquecimento, Médico)</Text>
      <TextInput
        style={styles.input}
        value={reason}
        onChangeText={setReason}
        placeholder="Digite o motivo principal"
      />

      <Text style={styles.label}>Descrição Detalhada</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Explique o que aconteceu..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar Solicitação'}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 40,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
