import React, { Component } from 'react';
import { StyleSheet} from 'react-native';

// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');
var whoosh;
export default class Ringtone extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount = async () =>{ 
        this.ringtoneplay();
    }
    componentWillUnmount() {		
        // Release the audio player resource
        whoosh.release();
	}
    ringtoneplay = () => {    
        // Load the sound file 'whoosh.mp3' from the app bundle
        // See notes below about preloading sounds within initialization code below.
        whoosh = new Sound(this.props.soundFile, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            // Play the sound with an onEnd callback
            whoosh.play((success) => {
                if (success) {
                    //console.log('successfully finished playing');
                    this.ringtoneplay();
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
                
            });
        });

        // Reduce the volume by half
        whoosh.setVolume(1);

        // Position the sound to the full right in a stereo field
        whoosh.setPan(1);

        // Loop indefinitely until stop() is called
        whoosh.setNumberOfLoops(-1);

        // Pause the sound
        whoosh.pause();

        // Stop the sound and rewind to the beginning
        whoosh.stop(() => {
            // Note: If you want to play a sound after stopping and rewinding it,
            // it is important to call play() in a callback.
            //whoosh.play();
        });

        
    }
    render() {
        return (
            <></>
        );
    }
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		...Platform.select({
			ios: {
			  paddingTop: 50,
			},
		}),
        paddingHorizontal: 15,
		paddingBottom: 20
	}
});