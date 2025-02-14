// helper.js
import { Alert, PermissionsAndroid, Platform } from "react-native";
import crypto from "crypto-js";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";

export const apiKey = "fvpk_400bd760-28f1-d5cb-ab2b-6e2838933169";
export const apiSecret =
  "fvsk_a53d25367d03ca01d4b66b707fbc9e623a51455f090c7c47db86e9ca24ef43c9";
export const projectId = 156794;
export const appId = "91d9a648e4f46b5ed9918f2276a8ccca";

export async function requestNotificationPermission() {
  if (Platform.OS === "ios") {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  } catch (err) {
    console.warn(err);
    return false;
  }
}
export async function requestCameraPermission() {
  if (Platform.OS === "ios") {
    return true;
  }

  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: "Cool App Notification Permission",
        message: "Cool App needs access to your Notification ",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "Cool App Camera Permission",
        message:
          "Cool App needs access to your camera " +
          "so you can take awesome pictures.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera");
      return true;
    } else {
      console.log("Camera permission denied");
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export const formatPhone = (num) => {
  num = num.replace(/\D/g, "");
  num = num.substring(0, 10);
  let telephone = "";

  if (num.length >= 1) {
    telephone = "(" + num.slice(0, 3);
  }

  if (num.length >= 4) {
    telephone += ") " + num.slice(3, 6);
  }

  if (num.length >= 7) {
    telephone += "-" + num.slice(6, 10);
  }

  return telephone;
};

export const convertUTCtoLocal = (utcString) => {
  const date = new Date(utcString);

  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = ("0" + date.getMinutes()).slice(-2);

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // La hora '0' debe ser '12'
  hours = ("0" + hours).slice(-2); // Relleno

  const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;

  return formattedDate;
};

export const convertImageToBase64 = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    //console.log("debug base64", base64);
    return base64;
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return null;
  }
};

export const convertPdfToBase64 = async (pdfPath) => {
  try {
    const base64String = await RNFS.readFile(pdfPath, "base64");
    console.log("debug base64 PDF", base64String);
    return base64String;
  } catch (error) {
    console.error("Failed to convert local PDF to base64:", error);
    return null;
  }
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Esto te dará el string completo data:image/png;base64,xxxxxx
      // Si solo quieres la parte de base64, puedes hacer split:
      const base64data = reader.result.split(",")[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
export const getDashboardItems = async () => {
  const jwt = await AsyncStorage.getItem("jwtToken");
  const response2 = await axios({
    method: "get", 
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    url: "https://api.qix.cloud/phaseFileVine"
  });
  
  const response3 = await axios({
    method: "get", 
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    url: "https://api.qix.cloud/phaseMerusCase"
  });

  const response = await axios.post(
    "https://qix.cloud/ajax/app_new.php",
    {
      appId: appId,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
export const getHeaders = async () => {
  const date = new Date();
  date.setMilliseconds(511);
  const timestamp = date.toISOString();
  const apiHash = crypto.MD5(`${apiKey}/${timestamp}/${apiSecret}`).toString();

  const sessionResponse = await axios.post(
    "https://api.filevine.io/session",
    {
      mode: "key",
      apiKey: apiKey,
      apiHash: apiHash,
      apiTimestamp: timestamp,
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const accessToken = sessionResponse.data.accessToken;
  const refreshToken = sessionResponse.data.refreshToken;
  const userId = sessionResponse.data.userId;
  const orgId = sessionResponse.data.orgId;

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-fv-sessionid": refreshToken,
    "x-fv-userid": userId,
    "x-fv-orgid": orgId,
  };
  await AsyncStorage.setItem("headers", JSON.stringify(headers));

  return headers;
};

export async function createPDF(
  dismissal,
  incident_date,
  inputName,
  inputPhone,
  inputEmail,
  birthday,
  inputEmployerName,
  inputDateHired,
  inputHoursWages,
  inputPayStUBPicture,
  inputGovIdPicture,
  inputAddress,
  inputAddress2,
  inputCity,
  inputZipCode
) {
  console.log(
    "props",
    dismissal,
    incident_date,
    inputName,
    inputPhone,
    inputEmail
  );

  const getImageBase64Html = async (imagePath) => {
    if (!imagePath) return { base64: "", html: "" };

    const base64 = await convertImageToBase64(imagePath);
    const html = `<img src="data:image/png;base64,${base64}" width="350"/>`;

    return { base64, html };
  };

  const employmentPayStub = await getImageBase64Html(inputPayStUBPicture);
  const govIdImage = await getImageBase64Html(inputGovIdPicture);

  let options = {
    html: `
      <p>Dismissal: ${dismissal}</p>
      <p>Incident Date: ${incident_date}</p>
      <p>Name: ${inputName}</p>
      <p>Phone: ${inputPhone}</p>
      <p>Email: ${inputEmail}</p>
      <p>Birthday: ${birthday}</p>
      <p>Employer Name: ${inputEmployerName}</p>
      <p>Date Hired: ${inputDateHired}</p>
      <p>Hours Wages: ${inputHoursWages}</p>
      <p>Pay Stub:</p>
      ${employmentPayStub.html}
      <p>Government ID:</p>
      ${govIdImage.html}
      <p>Address: ${inputAddress}</p>
      <p>Address2: ${inputAddress2}</p>
      <p>City: ${inputCity}</p>
      <p>Zip Code: ${inputZipCode}</p>
    `,
    fileName: "test3",
    directory: "docs",
  };

  return await RNHTMLtoPDF.convert(options);
}

export const handleDocumentOperation = async (
  fileName,
  size,
  uri,
  projectId
) => {
  try {
    const headers = await getHeaders();

    const response = await axios.post(
      `https://api.filevine.io/core/documents`,
      {
        filename: fileName,
        size: size,
      },
      {
        headers: headers,
      }
    );

    const url = response?.data?.url;
    const contentType = response?.data?.contentType;
    const documentId = response?.data?.documentId.native;

    const existingDocuments = await AsyncStorage.getItem(
      `allDocumentsId${projectId}`
    );
    let allDocumentsId = [];

    if (existingDocuments) {
      allDocumentsId = JSON.parse(existingDocuments);
    }

    allDocumentsId.push(documentId);

    await AsyncStorage.setItem(
      `allDocumentsId${projectId}`,
      JSON.stringify(allDocumentsId)
    );

    if (url) {
      await ReactNativeBlobUtil.fetch(
        "PUT",
        url,
        {
          "Content-Type": contentType,
        },
        ReactNativeBlobUtil.wrap(uri)
      );

      await axios.post(
        `https://api.filevine.io/core/projects/${projectId}/documents/${documentId}`,
        {
          documentId: { Native: documentId },
          filename: fileName,
          size: size,
          projectId: { Native: projectId },
          uploadDate: new Date().toISOString(),
          hashtags: ["doc"],
        },
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );

      return true;
    }
  } catch (error) {
    console.log("handleDocumentOperation error", error);
    throw error; // Rejects the promise
  }
};
