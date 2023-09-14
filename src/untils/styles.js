import { StyleSheet } from 'react-native';
import colors from "./colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    circle100: {
        width: 60,
        height: 60,
        borderRadius: 60/2,
        alignItems:'center',
        justifyContent:'center',
    },
    modalBackground: {
        width: '100%',
        height:'100%',
        alignItems: "center",
        justifyContent: "center"
    },
    activityIndicatorWrapper: {
        backgroundColor: 'rgba(42,18,103,0.25)',
        height: 200,
        width: 200,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        position: "absolute",
        paddingTop: 50
    },
    bottomMap: {
        flexDirection:'column',
        alignItems: 'center',
        alignContent: 'center',
        width: 40,
        height: 40,
        borderColor: '#548400',
        borderWidth: 1,
        backgroundColor: '#E6F2D1',
        borderRadius: 50,
        marginRight: 15,
    },bottomMapNoneColor: {
        flexDirection:'column',
        alignItems: 'center',
        alignContent: 'center',
        width: 30,
        height: 30,
    },
    groupDrawHelperButton: { // Cac phim ho thao tac dao doi tuong diem duong vung
        
    }
});

export default styles;
