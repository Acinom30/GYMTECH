import React, { useState, useEffect } from 'react';
import { Link, Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { styles_pdf } from '../ui/toastify/style';
import  logo from '../../image/logo.jpg';


const styles = styles_pdf;

const RoutinePdfDocument = ({ routine, ejerciciosPorDia }) => {
    const [userData, setUserData] = useState(null);
    const [evaluationData, setEvaluationData] = useState(null);


    useEffect(() => {
        const userRef = doc(db, 'usuarios', routine.clientId.id);

        const fetchUserData = async () => {
            try {
                const userSnapshot = await getDoc(userRef);
                if (userSnapshot.exists()) {
                    setUserData(userSnapshot.data());
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        };

        const fetchEvaluationData = async () => {
            if (routine.valoracion !== null) {
                const evaluationRef = doc(db, 'valoraciones', routine.valoracion);
                try {
                    const evaluationSnapshot = await getDoc(evaluationRef);
                    if (evaluationSnapshot.exists()) {
                        setEvaluationData(evaluationSnapshot.data());
                    } else {
                        console.error('No such document!');
                    }
                } catch (error) {
                    console.error('Error getting document:', error);
                }
            }
        }

        fetchUserData();
        fetchEvaluationData();
    }, [routine.clientId.id]);

    if (!userData) {
        return <Text>Loading...</Text>;
    }

    return (
        <Document>
            <Page style={styles.page}>
                <Image style={styles.logo} src={logo} /> { }
                <View style={styles.section}>
                    <Text style={styles.title}>Rutina - {userData.primerNombre} {userData.segundoNombre} {userData.primerApellido} {userData.segundoApellido}</Text>
                    {evaluationData ? (
                        <View style={styles.section}>
                            <Text style={styles.text}>Objetivo: {evaluationData.objetivo}</Text>
                            <Text style={styles.text}>Peso: {evaluationData.peso} kg</Text>
                            <Text style={styles.text}>Porcentaje de Grasa Corporal: {evaluationData.grasaCorporal}%</Text>
                            <Text style={styles.text}>Porcentaje de Músculo Corporal: {evaluationData.musculoCorporal}%</Text>
                            <Text style={styles.text}>Fecha de Cambio: {routine.fechaCambio}</Text>

                        </View>
                    ) : (
                        <View style={styles.section}>
                            <Text style={styles.text}>Sin valoración</Text>
                            <Text style={styles.text}>Fecha de Cambio: {routine.fechaCambio}</Text>
                            F
                        </View>
                    )}
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
                                    <Link style={styles.tableCol} target="_blank" src={ejercicio.url}>
                                        <Text style={styles.tableCell}>{ejercicio.nombre}</Text>
                                    </Link>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>{ejercicio.series}</Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>{ejercicio.observaciones}</Text>
                                    </View>
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
