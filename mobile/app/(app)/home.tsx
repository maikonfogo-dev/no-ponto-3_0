import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { location, isWithinRadius, distance, errorMsg, refreshLocation } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (type: string) => {
    // Force refresh location before registering to ensure accuracy
    await refreshLocation();

    if (!location) {
      Alert.alert('Erro', 'Não foi possível obter sua localização. Tente novamente.');
      return;
    }

    const confirmRegister = () => {
      setLoading(true);
      api.post('/attendance', {
        type: type.toUpperCase().replace(' ', '_').replace('Ç', 'C').replace('Í', 'I').replace('Ã', 'A'), // ENTRADA, SAIDA_ALMOCO, etc.
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      .then(() => {
        Alert.alert('Sucesso', `Ponto de ${type} registrado!`);
        // TODO: Update local history or status
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Erro', 'Falha ao registrar ponto. Tente novamente.');
      })
      .finally(() => {
        setLoading(false);
      });
    };

    if (!isWithinRadius) {
      Alert.alert('Atenção', `Você está fora do raio permitido (${distance?.toFixed(0)}m). O registro será marcado como "Fora do Perímetro".`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Registrar Mesmo Assim', onPress: confirmRegister }
      ]);
    } else {
      confirmRegister();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {user?.name || 'Colaborador'}</Text>
        <Text style={styles.status}>Status: Aguardando Entrada</Text>
        
        {location ? (
          <View style={styles.locationContainer}>
             <Text style={isWithinRadius ? styles.locationOk : styles.locationWarning}>
               {isWithinRadius ? '✅ Dentro do Raio' : '⚠️ Fora do Raio'} ({distance?.toFixed(0)}m)
             </Text>
          </View>
        ) : (
          <Text>{errorMsg || 'Obtendo localização...'}</Text>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleRegister('ENTRADA')}
          >
            <Text style={styles.buttonText}>Entrada</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FFC107' }]}
            onPress={() => handleRegister('SAIDA_ALMOCO')}
          >
            <Text style={styles.buttonText}>Saída Almoço</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#2196F3' }]}
            onPress={() => handleRegister('VOLTA_ALMOCO')}
          >
            <Text style={styles.buttonText}>Volta Almoço</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F44336' }]}
            onPress={() => handleRegister('SAIDA_FINAL')}
          >
            <Text style={styles.buttonText}>Saída Final</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/(app)/history')}>
          <Text>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(app)/adjustment')}>
          <Text>Solicitar Ajuste</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  locationContainer: {
    marginTop: 10,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  locationOk: {
    color: 'green',
    fontWeight: 'bold',
  },
  locationWarning: {
    color: 'red',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  button: {
    width: '45%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100, // Circular
    marginBottom: 20,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});
