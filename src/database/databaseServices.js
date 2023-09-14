import { realm } from "./scherma";
import { convertTimeToString, convertTimeShow } from "../untils/convertTime";
import { deleteFolderOrFile, objectToJson } from "./projectJson";
import { cpSync } from "fs";

const getListProjects = () => {
  const projects = realm.objects("projects").sorted("id", true);
  return Promise.resolve(projects);
};

const getProjectByID = (id) => {
  const project = realm.objectForPrimaryKey("projects", id);
  return Promise.resolve(project);
};

const insertProjects = (
  project_name,
  created_person,
  description,
  note,
  background_file,
  layout_file,
  projection
) => {
  let date = new Date();
  let project = {
    id: convertTimeToString(date), //20191209191400
    project_name: project_name,
    created_person: created_person,
    description: description,
    note: note,
    created_date: convertTimeShow(date),
    folder_name: convertTimeToString(date),
    drawing_object: "",
    background_file: background_file,
    layout_file: layout_file,
    projection: projection,
  };

  const tasks = realm.objects("projects");

  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create("projects", project, true);
      objectToJson(project, project.folder_name).then((r) => {});
      resolve(tasks);
    });
  });
};

const insertProjectsFromZip = (obj) => {
  let project = {
    id: obj.id,
    project_name: obj.project_name,
    created_person: obj.created_person,
    description: obj.description,
    note: obj.note,
    created_date: obj.created_date,
    folder_name: obj.folder_name,
    drawing_object: obj.drawing_object,
    background_file: obj.background_file,
    layout_file: obj.layout_file,
    projection: obj.projection,
  };

  const tasks = realm.objects("projects");

  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create("projects", project, true);
      objectToJson(obj, obj.folder_name).then((r) => {});
      resolve(tasks);
    });
  });
};

const updateProjects = (
  id,
  project_name,
  created_person,
  description,
  note,
  background_file,
  layout_file,
  projection
) => {
  const old = realm.objectForPrimaryKey("projects", id);
  let project = {
    id: id,
    project_name: project_name,
    created_person: created_person,
    description: description,
    note: note,
    created_date: old.created_date,
    folder_name: old.folder_name,
    drawing_object: old.drawing_object,
    background_file: background_file,
    layout_file: layout_file,
    projection: projection,
  };

  const tasks = realm.objects("projects");

  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create("projects", project, true);
      objectToJson(project, project.folder_name).then((r) => {});
      resolve(tasks);
    });
  });
};

const removeProjects = (id) => {
  const tasks = realm.objectForPrimaryKey("projects", id);
  return new Promise((resolve) => {
    realm.write(() => {
      deleteFolderOrFile(tasks.folder_name).then();
      realm.delete(tasks);
      resolve(tasks);
    });
  });
};

const getListFile = () => {
  const files = realm.objects("manager_file").sorted("date_create", true);
  return Promise.resolve(files);
};

const insertFile = (folder, name_file, type_file) => {
  let date = new Date();
  let file = {
    folder: folder, //id
    name_file: name_file,
    type_file: type_file,
    date_create: convertTimeShow(date),
  };

  const tasks = realm.objects("manager_file");

  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create("manager_file", file, true);
      resolve(tasks);
    });
  });
};

const updateFile = (folder, name_file) => {
  const old = realm.objectForPrimaryKey("manager_file", folder);
  let file = {
    folder: folder,
    name_file: name_file,
    type_file: old.type_file,
    date_create: old.date_create,
  };
  const tasks = realm.objects("manager_file");
  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create("manager_file", file, true);
      resolve(tasks);
    });
  });
};

const removeFile = (folder) => {
  const tasks = realm.objectForPrimaryKey("manager_file", folder);
  return new Promise((resolve) => {
    realm.write(() => {
      deleteFolderOrFile(tasks.folder).then();
      realm.delete(tasks);
      resolve(tasks);
    });
  });
};

const getListLayoutFile = (project_id) => {
  const files = realm
    .objects("layout_manager")
    .filtered(`project_id = "${project_id}"`)
    .sorted("fileID");

  const fileArray = Array.from(files, (file) => {
    // Extract desired field attributes from each file object
    const {
      fileID,
      fileName,
      fileName2,
      fileName3,
      type,
      size,
      visible,
      project_id,
      folderName,
      styleFillColor,
      styleLineColor,
      lineWidth,
    } = file;
    return {
      fileID,
      fileName,
      fileName2,
      fileName3,
      type,
      size,
      visible,
      project_id,
      folderName,
      styleFillColor,
      styleLineColor,
      lineWidth,
    };
  });

  return Promise.resolve(fileArray);
};

const insertLayoutFile = (
  fileName,
  fileName2,
  fileName3,
  type,
  size,
  project_id
) => {
  return new Promise((resolve, reject) => {
    try {
      const checkNameExist = realm
        .objects("layout_manager")
        .filtered(`project_id = "${project_id}"`)
        .filtered(`fileName = "${fileName}"`);

      var now = new Date();

      var year = now.getFullYear();
      var month = String(now.getMonth() + 1).padStart(2, "0");
      var day = String(now.getDate()).padStart(2, "0");
      var hours = String(now.getHours()).padStart(2, "0");
      var minutes = String(now.getMinutes()).padStart(2, "0");
      var seconds = String(now.getSeconds()).padStart(2, "0");

      var dateTimeString = year + month + day + hours + minutes + seconds;

      if (checkNameExist.length === 0) {
        realm.write(() => {
          const currentID = realm.objects("layout_manager").max("fileID");
          const nextID = currentID ? currentID + 1 : 1;
          let file = {
            fileID: nextID,
            fileName: fileName,
            fileName2: fileName2,
            fileName3: fileName3,
            type: type,
            size: size,
            visible: true,
            project_id: project_id,
            folderName: dateTimeString,
            styleFillColor: "#89e843",
            styleLineColor: "#0d6e7a",
            lineWidth: 1,
          };
          realm.create("layout_manager", file, true);
          resolve(dateTimeString);
        });
      } else {
        resolve(0);
      }
    } catch (err) {
      reject(err);
    }
  });
};

const updateStyleObj = (
  project_id,
  fileName,
  styleFillColorNew,
  styleLineColorNew,
  lineWidthNew
) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const objectEdit = realm
          .objects("layout_manager")
          .filtered(`project_id = "${project_id}"`)
          .filtered(`fileName = "${fileName}"`)[0];

        objectEdit.styleFillColor = styleFillColorNew;
        objectEdit.styleLineColor = styleLineColorNew;
        objectEdit.lineWidth = lineWidthNew;

        resolve(1);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const deleteLayoutFile = (fileName, project_id) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const objectDelete = realm
          .objects("layout_manager")
          .filtered(`project_id = "${project_id}"`)
          .filtered(`fileName = "${fileName}"`);
        realm.delete(objectDelete);

        resolve("success");
      });
    } catch (err) {
      reject(err);
    }
  });
};

const updateIndexLayoutFile = (fileName1, index1, fileName2, index2) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const obj1 = realm
          .objects("layout_manager")
          .filtered(`fileID = "${index1}"`)[0];
        const obj2 = realm
          .objects("layout_manager")
          .filtered(`fileID = "${index2}"`)[0];

        const tempID = obj1.fileID;
        obj1.fileID = obj2.fileID;
        obj2.fileID = tempID;

        resolve("success");
      });
    } catch (err) {
      console.log(err);
    }
  });
};

const updateShowHide = (index, status) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const obj = realm
          .objects("layout_manager")
          .filtered(`fileID = "${index}"`)[0];
        obj.visible = status;
        resolve("success");
      });
    } catch (err) {
      console.log(err);
    }
  });
};
//Track Manager
const getListTrack = (project_id) => {
  const files = realm
    .objects("trackLog")
    .filtered(`project_id = "${project_id}"`)
    .sorted("id");

  const fileArray = Array.from(files, (file) => {
    // Extract desired field attributes from each file object
    const { id, name, startTime, stopTime, length, project_id, fileName } =
      file;
    return {
      id,
      name,
      startTime,
      stopTime,
      length,
      project_id,
      fileName,
    };
  });

  return Promise.resolve(fileArray);
};

const insertTrack = (startTime, stopTime, length, project_id) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        const currentID = realm.objects("trackLog").max("id");
        const nextID = currentID ? currentID + 1 : 1;
        const fileSave = `Track_${nextID}`;
        let file = {
          id: nextID,
          name: `Track_${nextID}`,
          startTime: startTime,
          stopTime: stopTime,
          length: length,
          project_id: project_id,
          fileName: fileSave + ".geojson",
        };
        realm.create("trackLog", file, true);
        resolve(fileSave);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const deleteTrack = (name, project_id) => {
  return new Promise((resolve, reject) => {
    console.log(name, project_id);
    try {
      realm.write(() => {
        const objectDelete = realm
          .objects("trackLog")
          .filtered(`project_id = "${project_id}"`)
          .filtered(`name = "${name}"`);
        realm.delete(objectDelete);

        resolve("success");
      });
    } catch (err) {
      reject(err);
    }
  });
};

export {
  insertProjects,
  updateProjects,
  removeProjects,
  getListProjects,
  insertProjectsFromZip,
  insertFile,
  updateFile,
  removeFile,
  getListFile,
  getProjectByID,
  insertLayoutFile,
  getListLayoutFile,
  deleteLayoutFile,
  updateIndexLayoutFile,
  updateShowHide,
  updateStyleObj,
  getListTrack,
  insertTrack,
  deleteTrack,
};
