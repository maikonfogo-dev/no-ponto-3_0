import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

interface AdjustmentRequest {
  id: number;
  referenceDate: string;
  reason: string;
  description: string;
  status: string;
  user: {
    name: string;
    cpf: string;
  };
}

export default function ManagerAdjustments() {
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdjustmentRequest | null>(null);
  const [observation, setObservation] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingAdjustments();
  }, []);

  const fetchPendingAdjustments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/adjustments/pending');
      setRequests(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar ajustes pendentes.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      await api.put(`/adjustments/${selectedRequest.id}/respond`, {
        status,
        observation,
      });
      Alert.alert('Sucesso', `Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'}!`);
      setModalVisible(false);
      setObservation('');
      fetchPendingAdjustments(); // Refresh list
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao processar solicitação.');
    }
  };

  const openModal = (request: AdjustmentRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: AdjustmentRequest }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.headerRow}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.date}>{item.referenceDate}</Text>
      </View>
      <Text style={styles.reason}>{item.reason}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.status}>Pendente</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes Pendentes</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalhes da Solicitação</Text>
            {selectedRequest && (
              <>
                <Text style={styles.modalLabel}>Colaborador: <Text style={styles.modalValue}>{selectedRequest.user.name}</Text></Text>
                <Text style={styles.modalLabel}>Data: <Text style={styles.modalValue}>{selectedRequest.referenceDate}</Text></Text>
                <Text style={styles.modalLabel}>Motivo: <Text style={styles.modalValue}>{selectedRequest.reason}</Text></Text>
                <Text style={styles.modalLabel}>Descrição:</Text>
                <Text style={styles.modalText}>{selectedRequest.description}</Text>
                
                <Text style={styles.modalLabel}>Observação do Gestor:</Text>
                <TextInput
                  style={styles.input}
                  value={observation}
                  onChangeText={setObservation}
                  placeholder="Opcional"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={() => handleRespond('rejected')}
                  >
                    <Text style={styles.buttonText}>Rejeitar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={() => handleRespond('approved')}
                  >
                    <Text style={styles.buttonText}>Aprovar</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  date: {
    color: '#666',
  },
  reason: {
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  description: {
    color: '#777',
    marginBottom: 5,
  },
  status: {
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  modalValue: {
    fontWeight: 'normal',
    color: '#555',
  },
  modalText: {
    color: '#555',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  closeButtonText: {
    color: '#666',
  },
});
