// src/components/common/ConfirmModal.tsx
// Use this instead of Alert inside Modals — 100% reliable on Android

import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible, title, message, confirmText,
  cancelText = 'Cancel', confirmColor = '#1565C0',
  onConfirm, onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.box}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
              <Text style={s.cancelTxt}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtn, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={s.confirmTxt}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box:        { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%' },
  title:      { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 10 },
  message:    { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 20 },
  btnRow:     { flexDirection: 'row', gap: 10 },
  cancelBtn:  { flex: 1, backgroundColor: '#888', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  cancelTxt:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  confirmBtn: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  confirmTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});