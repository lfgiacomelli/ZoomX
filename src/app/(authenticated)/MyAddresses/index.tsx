  import { useEffect, useState } from 'react';
  import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
  import Entypo from '@expo/vector-icons/Entypo';

  import styles from './styles';
  import Header from '@components/Header';
  import { useAuth } from '@contexts/useAuth';

  type AddressProps = {
    end_codigo: number;
    usu_codigo: number;
    end_apelido: string;
    end_logradouro: string;
    end_numero: string;
    end_bairro: string;
    end_cep?: string;
  };

  const EMPTY_FORM = {
    end_apelido: '',
    end_logradouro: '',
    end_numero: '',
    end_bairro: '',
    end_cep: '',
  };

  export default function MyAddresses() {
    const [enderecos, setEnderecos] = useState<AddressProps[]>([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { user, token } = useAuth();
    const BASE_URL = 'https://backend-turma-a-2025.onrender.com';

    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/enderecos/${user?.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setEnderecos(data);
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
      }
    };

    const openAddModal = () => {
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setModalVisible(true);
    };

    const openEditModal = (address: AddressProps) => {
      setFormData({
        end_apelido: address.end_apelido,
        end_logradouro: address.end_logradouro,
        end_numero: address.end_numero,
        end_bairro: address.end_bairro,
        end_cep: address.end_cep ?? '',
      });
      setEditingId(address.end_codigo);
      setModalVisible(true);
    };

    const closeModal = () => {
      setModalVisible(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
    };

    const handleSave = async () => {
      const endpoint = editingId
        ? `${BASE_URL}/api/enderecos/editar/${editingId}`
        : `${BASE_URL}/api/enderecos/adicionar`;

      try {
        const response = await fetch(endpoint, {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            usu_codigo: user?.id,
          }),
        });

        if (response.ok) {
          await fetchAddresses();
          closeModal();
        }
      } catch (error) {
        console.error('Erro ao salvar endereço:', error);
      }
    };

    const handleDelete = async (id: number) => {
      try {
        const response = await fetch(`${BASE_URL}/api/enderecos/excluir/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await fetchAddresses();
        }
      } catch (error) {
        console.error('Erro ao excluir endereço:', error);
      }
    };

    useEffect(() => {
      fetchAddresses();
    }, []);

    return (
      <>
        <Header />
        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={styles.title}>Meus endereços</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Entypo name="add-to-list" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={enderecos}
            keyExtractor={(item) => item.end_codigo.toString()}
            renderItem={({ item }) => (
              <View style={styles.addressItem}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressNickname}>{item.end_apelido}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                      <Entypo name="edit" size={18} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.end_codigo)}>
                      <Entypo name="trash" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addressText}>{item.end_logradouro}, {item.end_numero}</Text>
                <Text style={styles.addressText}>{item.end_bairro}</Text>
                {item.end_cep && <Text style={styles.addressText}>CEP: {item.end_cep}</Text>}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum endereço cadastrado</Text>}
          />

          <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {editingId ? 'Editar Endereço' : 'Adicionar Endereço'}
                </Text>

                {['end_apelido', 'end_logradouro', 'end_numero', 'end_bairro', 'end_cep'].map((field, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    placeholder={field.replace('end_', '').replace('_', ' ').toUpperCase()}
                    value={formData[field as keyof typeof formData]}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, [field]: text }))
                    }
                    keyboardType={field === 'end_numero' || field === 'end_cep' ? 'number-pad' : 'default'}
                  />
                ))}

                <View style={styles.modalButtons}>
                  <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.submitButton]} onPress={handleSave}>
                    <Text style={styles.buttonText}>{editingId ? 'Salvar' : 'Adicionar'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </>
    );
  }
