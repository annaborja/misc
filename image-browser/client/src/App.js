import React, { Component } from 'react';

import ImageGroup from './ImageGroup.js';
import ImageModal from './ImageModal.js';
import Nav from './Nav.js';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageGroupParamsList: [],
      selectedImage: null,
    };

    this.closeModal = this.closeModal.bind(this);
    this.updateImageGroups = this.updateImageGroups.bind(this);
    this.updateSelectedImage = this.updateSelectedImage.bind(this);
  }

  closeModal() {
    this.setState({ selectedImage: null });
  }

  updateImageGroups(attribute, attributeValue) {
    if (!attribute) {
      this.setState({
        imageGroupParamsList: [{ attribute: undefined, attributeValue: undefined }],
      });

      return;
    }

    if (!attributeValue) {
      const imageGroupParamsListSnapshot = this.state.imageGroupParamsList.slice(0);

      fetch(`/api/imageAttributes/${attribute}`)
        .then(res => res.json())
        .then(fetchedAttributeValues => {
          // Since this is called asynchronously, it's possible that
          // the nav selection has been updated since this fetch chain began.
          // If so, don't update the image groups to the out-of-date selection.
          if (
            JSON.stringify(imageGroupParamsListSnapshot) !==
              JSON.stringify(this.state.imageGroupParamsList)
          ) {
            return;
          }

          this.setState({
            imageGroupParamsList: fetchedAttributeValues.map(fetchedAttributeValue =>
              ({ attribute, attributeValue: fetchedAttributeValue.toString() })
            ),
          });
        });

      return;
    }

    this.setState({
      imageGroupParamsList: [{ attribute, attributeValue }],
    });
  }

  updateSelectedImage(selectedImage) {
    this.setState({ selectedImage });
  }

  render() {
    return (
      <div>
        <header className='App-header'>
          <h1 className='App-title'><a className='App-title-link' href='/'>Image Browser</a></h1>
        </header>

        <Nav onNavSelect={this.updateImageGroups} />

        {
          this.state.imageGroupParamsList.map((imageGroupParams, i) =>
            <ImageGroup
              key={`${JSON.stringify(imageGroupParams)}_${i}`}
              attribute={imageGroupParams.attribute}
              attributeValue={imageGroupParams.attributeValue}
              onImageSelect={this.updateSelectedImage}
            />
          )
        }

        {
          this.state.selectedImage &&
            <ImageModal image={this.state.selectedImage} closeModal={this.closeModal} />
        }
      </div>
    );
  }
}

export default App;
