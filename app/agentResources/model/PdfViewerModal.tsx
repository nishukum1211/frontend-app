import { ActivityIndicator, Dimensions, Modal, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';

interface PdfViewerModalProps {
    visible: boolean;
    uri: string | null;
    onClose: () => void;
}

export default function PdfViewerModal({ visible, uri, onClose }: PdfViewerModalProps) {
    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                {uri ? (
                    <Pdf
                        source={{ uri }}
                        style={styles.pdf}
                        trustAllCerts={false}
                        renderActivityIndicator={() => (
                            <ActivityIndicator color="#007AFF" size="large" />
                        )}
                        onError={(error) => {
                            console.log(error);
                        }}
                    />
                ) : null}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
