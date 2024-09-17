import React, { Component, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, Alert } from 'react-native';
import CheckBox from 'react-native-check-box';
import Pdf from "react-native-pdf";
const RNFS = require("react-native-fs");
import Signature from "react-native-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { decode as atob, encode as btoa } from "base-64";
import Modal from 'react-native-modal';
import axios from 'axios';
// import 
//const source = {uri:global.baseUrl+"intake_docusign.pdf",cache:true};
var sourceUrl = global.baseUrl+"pdfs/";
var uploadCount = 1;
var savedFilePath = [];
var filePath = RNFS.DocumentDirectoryPath+'/intake'+uploadCount+'.pdf';
const checkImage = "iVBORw0KGgoAAAANSUhEUgAAAuQAAAFQCAYAAAD3F2ubAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAC5KADAAQAAAABAAABUAAAAAAPHrPJAAAckElEQVR4Ae3dDewkZ10HcOiVtvSupS9X02tLW85SbSKFUrFSgYo2vMQq2gQhGoIEY5GXiBiEEpsYrURFxBpjNAUExGsUFZFGJWKLQhUhvpYYtMD5Em2olShqYnyJfh+5Sfe2szPP7O3uf2b3M8nvdnfmefk9n9ndeW7/s7OPeISFAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECeyOwP90+M3H23nSvVwIECBAgQIAAAQK7J3BBhnxL4tOJ/z0W/5jbsxIWAgQIECBAgAABAgRWLPDotHdj4kiimYC33T5nxf1qjgABAgQIECBAgMDOClyUkX934h8SbZPv+XWfSLnTExYCBAgQIECAAAECBJYQ2Jc6z0rckZifbHc9/vGUvzpR6lsIECBAgAABAgQIEBggcGHK3pT470TXpHt22z+l7K2JgwkLAQIECBAgQIAAAQIDBE5O2WsSv56YnWT33f/rlH9FwpVUgmAhQIAAAQIECBAgMESgfJJdJtP/kuibeM9u/1jKPzVxasJCgAABAgQIECBAgMAAgSek7C8mZifYNfffkTpPSlgIECBAgAABAgQIEBggcEbKfnviXxM1E+/ZMm9InYsTFgIECBAgQIAAAQIEBgh8Scq+LTE7ua65/x+p8/LEYxIWAgQIECCwMoEDaemtiX87FuV+WWchQIDAtgiUH+d5fuKziZqJ92yZP02d6xPlS50WAgQIECCwFoE/SKuzB5/m/plr6U2jBAgQ2IzAZenmtkTznjbk9ldT78mJRyYsBAgQIEBg7QL/kx4WHaiuWHvvOiBAgMBqBE5KM89OfDKx6D2ta/0Ppd4lCQsBAgQIENi4QNeEvBy8nrPxjHRIgACBOoHzU6x8sbJrot217TtT118D66yVIkCAAIE1Ciw6ZWX2IHZkjf1rmgABAkMEyo/zfDgx+x5Ve//+1Lsx8aiEhQABAgQIjEagfIHzLxI1B7RzR5O1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bkg3n0/UTMRLmS/fTFp6IUCAAAECBAgQILCbAocz7Hcm2iboN+8miVETIECAAIHpCLjKwnT2lUwJ1AiUyfn1xwp+MLefqamkDAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBMYn8H+nq/T6JFrE8AAAAABJRU5ErkJggg==";
export default class Docusign extends Component {
	constructor(props) {
		super(props);
		this.state = {
            docusign: 1,
            pdfEditMode: false,
            fileDownloaded: false,
            getSignaturePad: false,
            signatureBase64: "",
            setsignatureBase64: "",
            signatureArrayBuffer: null,
            setSignatureArrayBuffer: null,
            pdfBase64: null,
            setPdfBase64: null,
            pdfArrayBuffer: null,
            setPdfArrayBuffer: null,
            newPdfSaved: false,
            setNewPdfSaved: false,
            newPdfPath: null,
            setNewPdfPath: null,
            pageWidth: 0,
            setPageWidth: 0,
            pageHeight: 0,
            setPageHeight: 0,
            viewPdf: true,
            orientation: false,
            isChecked1: false,
            isChecked2: false,
            isChecked3: false,
            isChecked4: false,
            modalVisible: false,
            today: "",
            incident: "",
            birthday: "",
            pdfScale: 1,
            submitBtnTxt: this.props.translate("next"),
        }
  };
  getOrientation = () => {
    //if(this.refs.rootView)
    //{
      if(Dimensions.get('window').width < Dimensions.get('window').height)
      {
        this.setState({orientation: false});
      }else{
        this.setState({orientation: true});
      }
      console.log(this.state.orientation);
      console.log(Dimensions.get('window').width);
    //}//

    //console.log('000');
  }
  getCurretDate = () =>{
    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var yyyy = now.getFullYear();
    now = mm + '/' + dd + '/' + yyyy;
    this.setState({today: now});

  }
  componentDidMount()
  {
    this.downloadFile();
    if (this.state.signatureBase64){
        this.setState({signatureArrayBuffer: this._base64ToArrayBuffer(this.state.signatureBase64)});
    }
    if (this.state.newPdfSaved){
        filePath = this.state.newPdfPath;
        console.log("savedFilePath", savedFilePath);
        this.setState({pdfArrayBuffer: this._base64ToArrayBuffer(this.state.pdfBase64)});
    }
    const params = new FormData();
    params.append('method', 'get_dates');
    params.append('contact_id', global.contactId);
    axios({
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
      data: params
      }).then(res => {
        console.log(res.data);
        if (res.data.status == "success") {
          this.setState({ incident: res.data.incident });   
          this.setState({ birthday: res.data.birthday}) ;
        }
      });
    this.getCurretDate();
    
    this.getOrientation();
    Dimensions.addEventListener('change', () =>
    {
      this.getOrientation();
    });
  }
    _base64ToArrayBuffer = (base64) => {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
    
    _uint8ToBase64 = (u8Arr) => {
        const CHUNK_SIZE = 0x8000; //arbitrary number
        let index = 0;
        const length = u8Arr.length;
        let result = "";
        let slice;
        while (index < length) {
        slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
        }
        return btoa(result);
    }
    downloadFile = () => {
      console.log("___downloadFile -> Start");
  
      RNFS.downloadFile({
         fromUrl: sourceUrl+"intake"+uploadCount+".pdf",
         toFile: filePath,
      }).promise.then((res) => {
        console.log("___downloadFile -> File downloaded", res);
        this.setState({fileDownloaded: true});
        this.readFile();
      })
    }
    readFile = () => {
      console.log("___readFile -> Start");
        RNFS.readFile(RNFS.DocumentDirectoryPath+'/intake'+uploadCount+'.pdf', "base64").then((contents) => {
            this.setState({pdfBase64: contents});
            this.setState({pdfArrayBuffer: this._base64ToArrayBuffer(contents)});
        })
      }
    getSignature = () => {
        console.log("___getSignature -> Start");
        this.getOrientation();
        this.setState({getSignaturePad: true});
        //this.setState({modalVisible: true});
      }

    handleSignature = signature => {
        console.log("___handleSignature -> Start");        
        this.setState({signatureArrayBuffer: signature.replace("data:image/png;base64,", "")});
        this.setState({getSignaturePad: false});
        this.setState({pdfEditMode: true});
        this.handleSingleTap();
    }
    saveCheckbox = () =>{
      this.setState({modalVisible: false});
    }
    handleSingleTap = async () => {
      this.getCurretDate();
      this.setState({newPdfSaved: false});
      filePath = null;
      this.setState({viewPdf: false});
      const pdfDoc = await PDFDocument.load(this.state.pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      for(page = 0;page <= pages.length-1;page++){
        const firstPage = pages[page]
        const signatureImage = await pdfDoc.embedPng(this.state.signatureArrayBuffer)
        const signatureCheckImage = await pdfDoc.embedPng(checkImage);
        if(uploadCount == 1){
          if(page == 0){
            firstPage.drawImage(signatureImage, {
              x: 160,
              y: 70,
              width: 50,
              height: 50,
            }),
            firstPage.drawText(this.state.today, {
              x: 390,
              y: 95,
              size: 10
            });
          }
          if(page == 1){
            firstPage.drawImage(signatureImage, {
              x: 270,
              y: firstPage.getHeight()-340,
              width: 50,
              height: 50,
            }),
            firstPage.drawText(this.state.today, {
              x: 120,
              y: firstPage.getHeight()-320,
              size: 10
            }),
            firstPage.drawText(this.state.incident, {
              x: 120,
              y: firstPage.getHeight()-195,
              size: 10
            });
          }
          if(page == 2){
            firstPage.drawText(global.name, {
              x: 135,
              y: firstPage.getHeight()-115,
              size: 15
            }),
            firstPage.drawText(this.state.birthday, {
              x: 325,
              y: firstPage.getHeight()-115,
              size: 10
            }),
            firstPage.drawImage(signatureImage, {
              x: 220,
              y: 140,
              width: 50,
              height: 30,
            }),
            firstPage.drawText(this.state.today, {
              x: 75,
              y: 150,
              size: 10
            }),
            firstPage.drawText(this.state.today, {
              x: 75,
              y: 110,
              size: 10
            });
            if(this.state.isChecked1){
              firstPage.drawImage(signatureCheckImage, {
                x: 73,
                y: firstPage.getHeight()-270,
                width: 50,
                height: 50,
              });
            }
            if(this.state.isChecked2){
              firstPage.drawImage(signatureCheckImage, {
                x: 73,
                y: firstPage.getHeight()-295,
                width: 50,
                height: 50,
              });
            }
            if(this.state.isChecked3){
              firstPage.drawImage(signatureCheckImage, {
                x: 73,
                y: firstPage.getHeight()-315,
                width: 50,
                height: 50,
              });
            }
            if(this.state.isChecked4){
              firstPage.drawImage(signatureCheckImage, {
                x: 73,
                y: firstPage.getHeight()-350,
                width: 50,
                height: 50,
              });
            }
          }
        }
        if(uploadCount == 2){
          if(page == 0){
            firstPage.drawImage(signatureImage, {
              x: 175,
              y: 290,
              width: 50,
              height: 30,
            }),
            firstPage.drawText(global.name, {
              x: 185,
              y: 275,
              size: 15
            }),
            firstPage.drawText(this.state.today, {
              x: 430,
              y: 300,
              size: 10
            }),
            firstPage.drawText(this.state.today, {
              x: 430,
              y: 120,
              size: 10
            });
          }
          if(page == 1){
            firstPage.drawImage(signatureImage, {
              x: 320,
              y: 310,
              width: 50,
              height: 50,
            }),
            firstPage.drawText(this.state.today, {
              x: 140,
              y: firstPage.getHeight()-360,
              size: 10
            })
          }
          if(page == 3){
            firstPage.drawImage(signatureImage, {
              x: 135,
              y: firstPage.getHeight()-235,
              width: 50,
              height: 30,
            }),
            firstPage.drawText(this.state.birthday, {
              x: 345,
              y: firstPage.getHeight()-225,
              size: 10
            });            
          }
        }
        if(uploadCount == 3){
          if(page == 0){
            firstPage.drawImage(signatureImage, {
              x: 140,
              y: 60,
              width: 50,
              height: 30,
            }),
            firstPage.drawText(this.state.today, {
              x: 360,
              y: 65,
              size: 10
            });
          }
          if(page == 1){
            firstPage.drawText(global.name, {
              x: 170,
              y: firstPage.getHeight()-415,
              size: 15
            });
          }
          if(page == 3){
            firstPage.drawImage(signatureImage, {
              x: 70,
              y: firstPage.getHeight()-210,
              width: 50,
              height: 30,
            }),
            firstPage.drawText(this.state.today, {
              x: 370,
              y: firstPage.getHeight()-200,
              size: 10
            }),
            firstPage.drawText(this.state.today, {
              x: 370,
              y: firstPage.getHeight()-260,
              size: 10
            });
          }
        }
      }
        console.log(page);
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = this._uint8ToBase64(pdfBytes);
        const path = RNFS.DocumentDirectoryPath + "/signed_"+ Date.now() +".pdf";

        RNFS.writeFile(path, pdfBase64, "base64").then((success) => {        
          filePath = path;   
          savedFilePath[uploadCount] = path;
          this.readFile();
        })
        .catch((err) => {
          console.log(err.message);
        });
      this.setState({viewPdf: true});
        //}
    }
    submitPdf = () => {  
      
      var filePaths = filePath.split("/");
      var filename = filePaths[filePaths.length-1];
      if(filename == "intake"+uploadCount+".pdf"){
          Alert.alert(this.props.translate("pleaseSign"));
      }else{ 
        uploadCount++;        
        if(uploadCount > 3){   
          Alert.alert(
            this.props.translate("wantSubmitPdf"),
            "",
            [
              {
              text: this.props.translate("cancel"),
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
              },
              { text: this.props.translate("ok"), onPress: () => this.uploadPdf() }
            ],
            { cancelable: false }
          );
        }else{
          this.setState({
            docusign: 1,
            pdfEditMode: false,
            fileDownloaded: false,
            getSignaturePad: false,
            signatureBase64: "",
            setsignatureBase64: "",
            signatureArrayBuffer: null,
            setSignatureArrayBuffer: null,
            pdfBase64: null,
            setPdfBase64: null,
            pdfArrayBuffer: null,
            setPdfArrayBuffer: null,
            newPdfSaved: false,
            setNewPdfSaved: false,
            newPdfPath: null,
            setNewPdfPath: null,
            pageWidth: 0,
            setPageWidth: 0,
            pageHeight: 0,
            setPageHeight: 0,
            viewPdf: true,
            orientation: false,
          });
          if( uploadCount == 3)this.setState({submitBtnTxt: this.props.translate("submit")});
          filePath = RNFS.DocumentDirectoryPath+'/intake'+uploadCount+'.pdf';
          this.downloadFile();
        }
      }
    }
    uploadPdf = () => { 
      var file_prefix = Platform.OS === 'ios' ? "" : "file://"; 
        var filePath1 = savedFilePath[1];
        var filePaths = filePath1.split("/");
        var filename1 = filePaths[filePaths.length-1];
        var filePath2 = savedFilePath[2];
        var filePaths = filePath2.split("/");
        var filename2 = filePaths[filePaths.length-1];
        var filePath3 = filePath;
        var filePaths = filePath3.split("/");
        var filename3 = filePaths[filePaths.length-1];
        var data = new FormData();
        data.append('pdf[]', {
          uri: file_prefix+filePath1,
          name: filename1,
          type: 'application/pdf'
        });
        data.append('pdf[]', {
          uri: file_prefix+ filePath2,
          name: filename2,
          type: 'application/pdf'
        });
          data.append('pdf[]', {
          uri: file_prefix+filePath3,
          name: filename3,
          type: 'application/pdf'
        });
        data.append('method', 'pdf_upload');
        data.append('contact_id', global.contactId);
        console.log(filePath1);
        var path = global.baseUrl+"wp-admin/admin-ajax.php?action=contact_api";
        this.setState({viewPdf: false});
        fetch(path,{
          header: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          },
          method:'POST',
          body: data
        }).then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          if(responseJson.status == "success"){
            this.backstep();
          } else{
            //this.setState({uploadStatus: "Failed."});
            this.setState({viewPdf: true});
          }
        })
        .catch((error) => {
          console.error(error);
          this.setState({viewPdf: true});
        }); 
      //} 
    }
    
	backstep = () => {
    if(uploadCount > 3){
      this.props.updatesign(0);
    }
  }
  pdfZoomOut = () => {
    var scale = this.state.pdfScale;
    if(scale < 1.9) this.setState({pdfScale: scale + 0.1});
  }
  pdfZoomIn = () => {
    var scale = this.state.pdfScale;
    if(scale > 1) this.setState({pdfScale: scale - 0.1});
  }
	render() {
		return (
			<>            
                <View style={styles.container}>  
                { this.state.getSignaturePad ? (
                  <View style={styles.container}>
                    { this.state.orientation ? (
                      <View style={styles.container}>
                    <Signature
                        onOK={(sig) => this.handleSignature(sig)}
                        onEmpty={() => console.log("___onEmpty")}
                        descriptionText={this.props.translate("pleaseSignHere")}
                        clearText={this.props.translate("clear")}
                        confirmText={this.props.translate("save")}
                    />
                    </View>
                    ) : (!this.state.orientation && (
                      <View style={styles.container}>
                      <Signature
                          onOK={(sig) => this.handleSignature(sig)}
                          onEmpty={() => console.log("___onEmpty")}
                          descriptionText={this.props.translate("pleaseSignHere")}
                          clearText={this.props.translate("clear")}
                          confirmText={this.props.translate("save")}
                          webStyle={'.m-signature-pad{height: 250px;margin: auto;}'}
                      />
                      </View>
                    ))}
                  </View>
                ) : ((this.state.fileDownloaded) && ( 
                    <View>
                        { this.state.viewPdf ? (
                            <View>
                        <Text style={styles.headerText}>Signature</Text>
                        <View style={{alignItems: 'flex-end', paddingRight: 50, flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5}}>
                          <Text onPress={this.pdfZoomOut} style={{fontSize: 30}}>+</Text>
                          <Text onPress={this.pdfZoomIn} style={{fontSize: 30, marginLeft: 15}}>-</Text>
                        </View>
                        <Pdf
                            minScale={1.0}
                            maxScale={2.0}
                            scale={this.state.pdfScale}
                            spacing={0}
                            fitPolicy={0}
                            enablePaging={true}
                            source={{uri: filePath}}
                            usePDFKit={false}
                            onLoadComplete={(numberOfPages,filePath, {width, height})=>{
                                this.setState({pageWidth: width});
                                this.setState({pageHeight: height});
                            }}
                            style={styles.pdf}/>
                            </View>                
                        ) : (
                            <View style={{justifyContent: 'center'}}>
                            <Image source={require('../images/loading.gif')} style={{ width: 50, height:50 }} />
                            </View>
                        )}
                        { this.state.viewPdf && this.state.pdfEditMode ? (
                            <View style={styles.message}>
                              <Text>* Review Document *</Text>
                              <Text>Please check if everythig is correct</Text>
                              <View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center" }}>
                              <View style={{marginHorizontal:5}}>
                                <TouchableOpacity
                                  onPress={this.getSignature}
                                  style={styles.button}
                              >
                                <Text style={styles.buttonText}>{this.props.translate("signDocument")}</Text>
                              </TouchableOpacity></View>
                              <View style={{marginHorizontal:5}}><TouchableOpacity
                                  onPress={this.submitPdf}
                                  style={styles.button}
                              >
                                <Text style={styles.buttonText}>{this.state.submitBtnTxt}</Text>
                              </TouchableOpacity></View>
                              </View>
                            </View>
                        ) : (this.state.viewPdf && (
                            <View>
                            <TouchableOpacity
                                onPress={this.getSignature}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>{this.props.translate("signDocument")}</Text>
                            </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}
                <Modal isVisible={this.state.modalVisible} deviceWidth={Dimensions.get('window').width} deviceHeight={Dimensions.get('window').height}>
                    <View style={{backgroundColor: '#fff', padding: 20, borderRadius: 10}}>
                      <View style={{flexDirection: 'row'}}>
                        <CheckBox 
                        style={{flex: 1, padding:10}} 
                        isChecked={this.state.isChecked1}
                        onClick={()=>{
                          this.setState({isChecked1: !this.state.isChecked1});
                        }}
                        rightText={"All billing records showing all charges, expenses, costs and payments. Original x-ray filims"}
                        />
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <CheckBox 
                        style={{flex: 1, padding:10}} 
                        isChecked={this.state.isChecked2}
                        onClick={()=>{
                          this.setState({isChecked2: !this.state.isChecked2});
                        }}
                        rightText={"Drug and alcohol abuse testing, evaluation and treatment."}
                        />
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <CheckBox 
                        style={{flex: 1, padding:10}} 
                        isChecked={this.state.isChecked3}
                        onClick={()=>{
                          this.setState({isChecked3: !this.state.isChecked3});
                        }}
                        rightText={"Mental health information consisting of, but not limited to, all note, records and reports of psychotherapy disgnosis, evaluation and treatment."}
                        />
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <CheckBox 
                        style={{flex: 1, padding:10}} 
                        isChecked={this.state.isChecked4}
                        onClick={()=>{
                          this.setState({isChecked4: !this.state.isChecked4});
                        }}
                        rightText={"Employment, personal, attendence, wage, injuries, claims, and human resource records."}
                        />
                      </View>

                      <TouchableOpacity
                                onPress={this.saveCheckbox}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>{this.props.translate("save")}</Text>
                      </TouchableOpacity>
                    </View>
                  
                </Modal>
                </View>
			</>
		);
	}
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f4f4f4",
      width: '100%'
    },
    headerText: {
      fontFamily: 'Quicksand-Regular',
      color: "#508DBC",
      fontSize: 20,
      marginBottom: 10,
      alignSelf: "center"
    },
    pdf: {
      width: Dimensions.get("window").width,
      height: 480,
    },
    button: {
      fontFamily: 'Quicksand-Regular',
      alignItems: "center",
      backgroundColor: "#508DBC",
      padding: 10,
      marginVertical: 10
    },
    buttonText: {
      fontFamily: 'Quicksand-Regular',
      color: "#DAFFFF",
    },
    message: {
      fontFamily: 'Quicksand-Regular',
      alignItems: "center",
      padding: 15,
      // backgroundColor: "#FFF88C"
    }
  });
