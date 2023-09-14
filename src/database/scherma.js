import Realm from "realm";

const point_base = {
  name: "point_base",
  primaryKey: "id",
  properties: {
    id: "string",
    object_id: "string",
    lat: "string",
    long: "string",
  },
};

const photo = {
  name: "photo",
  primaryKey: "id",
  properties: {
    id: "string",
    object_id: "string",
    path: "string",
  },
};

const object_properties = {
  name: "object_properties",
  primaryKey: "id",
  properties: {
    id: "string",
    object_id: "string",
    property_id: "string",
    property_value: "string",
  },
};

const properties = {
  name: "properties",
  primaryKey: "id",
  properties: {
    id: "string",
    name: "string",
    scope: "string",
  },
};

const drawing_object = {
  name: "drawing_object",
  primaryKey: "id",
  properties: {
    id: "string",
    project_id: "string",
    type: "string",
    name: "string",
    created_date: "string",
    list_point: "string", // point_base
    list_properties: "string", //object_properties
    list_photo: "string", //photo
  },
};

const projects = {
  name: "projects",
  primaryKey: "id",
  properties: {
    id: "string",
    project_name: "string",
    created_person: "string",
    description: "string",
    note: "string",
    created_date: "string",
    folder_name: "string",
    drawing_object: "string",
    background_file: "string",
    layout_file: "string",
    projection: "int",
  },
};

const manager_file = {
  name: "manager_file",
  primaryKey: "folder",
  properties: {
    folder: "string",
    name_file: "string",
    type_file: "string", //BACKGROUND or LAYOUT
    date_create: "string",
  },
};

const layoutManager = {
  name: "layout_manager",
  primaryKey: "fileID",
  properties: {
    fileID: "int",
    fileName: "string",
    fileName2: "string",
    fileName3: "string",
    type: "string",
    size: "float",
    visible: "bool",
    project_id: "string",
    folderName: "string",
    styleFillColor: "string",
    styleLineColor: "string",
    lineWidth: "int",
  },
};

const trackLog = {
  name: "trackLog",
  primaryKey: "id",
  properties: {
    id: "int",
    name: "string",
    startTime: "string",
    stopTime: "string",
    length: "float",
    project_id: "string",
    fileName: "string",
  },
};

export const realm = new Realm({
  schema: [
    manager_file,
    projects,
    drawing_object,
    point_base,
    photo,
    object_properties,
    properties,
    layoutManager,
    trackLog,
  ],
});
