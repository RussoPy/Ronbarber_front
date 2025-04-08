// components/ContactSearch.js
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function ContactSearch({
  contacts,
  showContacts,
  searchTerm,
  setSearchTerm,
  loadContacts,
  onSelectContact,
  onHide,
}) {
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => showContacts ? onHide() : loadContacts()}
          style={[styles.button, { backgroundColor: '#8b499c' }]}
        >
          <Text style={styles.buttonText}>
            {showContacts ? "Hide Contacts" : "Load Contacts"}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Search contact"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      {showContacts && (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => onSelectContact(item)}>
              <Text style={styles.cardText}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.phoneNumbers[0].number}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    borderBottomWidth: 2,
    borderColor: '#95A5A6',
    color: '#2C3E50',
  },
  list: { maxHeight: 300 },
  card: {
    backgroundColor: '#F7E7CE',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  cardSub: {
    color: '#95A5A6',
    fontSize: 14,
  },
});
