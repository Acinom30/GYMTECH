import { StyleSheet } from '@react-pdf/renderer';

export const styles_pdf = StyleSheet.create({
    page: {
        padding: 30,
    },

    logo: {
        width: 80,
        height: 80,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 20,
    },
    section: {
        margin: 5,
        padding: 5,
    },
    title: {
        fontSize: 16,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 5,
    },
    text: {
        fontSize: 11,
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