import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
    },
    section: {
        margin: 5,
        padding: 5,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 5,
    },
    text: {
        fontSize: 12,
    },
    table: {
        display: 'table',
        width: 510,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCol: {
        width: '29%', 
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
    },
    colorCol: {
        width: '13%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
    },
    tableCell: {
        margin: 'auto',
        fontSize: 10,
    },
});

const RoutinePdfDocument = ({ routine, ejerciciosPorDia }) => {
    return (
        <Document>
            <Page style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>Rutina</Text>
                    <Text style={styles.text}>Fecha de Cambio: {routine.fechaCambio}</Text>
                </View>
                {Object.keys(ejerciciosPorDia).map((dia, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.subtitle}>Ejercicios - Día {dia}</Text>
                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Nombre</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Series</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Observaciones</Text></View>
                                <View style={styles.colorCol}><Text style={styles.tableCell}>Alternado</Text></View>
                            </View>
                            {ejerciciosPorDia[dia].map((ejercicio, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{ejercicio.nombre}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{ejercicio.series}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{ejercicio.observaciones}</Text></View>
                                    <View style={[styles.colorCol, { backgroundColor: ejercicio.color }]}>
                                        <View style={styles.colorCell} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </Page>
        </Document>
    );
};

export default RoutinePdfDocument;
