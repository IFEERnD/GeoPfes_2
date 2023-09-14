import { Platform } from 'react-native';
import {insertProjectsFromZip} from "./databaseServices";
import {unzip} from "react-native-zip-archive";
import { Toast } from 'native-base';
const RNFS = require('react-native-fs');

export const dirHome = Platform.select({
    ios: `${RNFS.DocumentDirectoryPath}`,
    android: `${RNFS.DocumentDirectoryPath}`
});

export const objectToJson = async (obj, folder) => {
    let path = dirHome + '/'+folder +'/project.txt';
    return new Promise((resolve, reject) => {
        RNFS.mkdir(dirHome + '/'+folder)
            .then(() => {
                RNFS.writeFile(path, JSON.stringify(obj), 'utf8')
                    .then((success) => {
                        console.log('FILE WRITTEN!');
                    })
                    .catch((err) => {
                        console.log(err.message);
                    });
            })
            .catch(err => {
                console.log('mkdir error', err);
                reject(err);
            });
    });
};

export const saveObjectDrawer = async (obj, folder) => {
    let path = dirHome + '/'+folder +'/objectDrawer.txt';
    return new Promise((resolve, reject) => {
        RNFS.writeFile(path, JSON.stringify(obj), 'utf8')
            .then((success) => {
                console.log('FILE WRITTEN!');
            })
            .catch((err) => {
                console.log(err.message);
                reject(err);
            });
    });
};

export const getObjectDrawerShare = async (folder) => {
    let path = dirHome + '/'+folder +'/objectDrawer.txt';
    return new Promise((resolve, reject) => {
        RNFS.readFile(path, "utf8")
            .then(res => {
                let obj = JSON.parse(res);
                resolve(obj)
            })
            .catch(err => {
                Toast.show({
                    text: "Không có đối tượng trong dự án đã chọn",
                    buttonText: "Tắt",
                    type: "warning"
                })
                reject(err);
            });
    });
};

export const getObjectDrawer = async (folder) => {
    let path = dirHome + '/'+folder +'/objectDrawer.txt';
    console.log('Duong dan thu muc:  ',path)
    return new Promise((resolve, reject) => {
        RNFS.readFile(path, "utf8")
            .then(res => {
                let obj = JSON.parse(res);
                resolve(obj)
            })
            .catch(err => {
                reject(err);
            });
    });
};

export const deleteFolderOrFile = async (folder_file) => {
    let path = dirHome + '/'+folder_file;
    try{
        RNFS.exists(path)
            .then((res) => {
                if (res) {
                    RNFS.unlink(path)
                        .then(() => console.log('FILE DELETED'))
                }
            })
    } catch (e) {
        console.log('delete error', e.toString());
    }
};

// export const dirPicutures = `${dirHome}/Pictures/XuanMai_DBR_2017.mbtiles`;
