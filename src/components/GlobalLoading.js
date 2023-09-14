import React from 'react';
import {View, StyleSheet} from 'react-native';
import {BallIndicator} from 'react-native-indicators';
export const LOADING_MODE = {
    SMALL: 'small',
    FULL: 'full',
    OVERLAY: 'overlay',
};
const Loading = ({mode, style, color}) => {
    let containerStyle = styles.container;

    switch (mode) {
        case LOADING_MODE.FULL:
            containerStyle = styles.container_full_stretch;
            break;
        case LOADING_MODE.SMALL:
            containerStyle = styles.container_full_stretch;
            break;
        case LOADING_MODE.OVERLAY:
            containerStyle = styles.container_overlay;
            break;
    }

    return (
        <View style={[containerStyle, style]}>
            <BallIndicator
                size={mode === LOADING_MODE.SMALL ? 18: 55}
                color={color || '#ffffff'}
            />
        </View>
    );
};

export default Loading;

Loading.defaultProps = {
    mode: LOADING_MODE.OVERLAY,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        height: undefined,
        width: undefined,
    },
    container_full_stretch: {
        flexGrow: 1,
        height: undefined,
        width: undefined,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container_overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: undefined,
        width: undefined,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
    },
});
