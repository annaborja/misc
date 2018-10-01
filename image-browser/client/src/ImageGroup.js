import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Image from './Image.js';
import LoadingIndicator from './LoadingIndicator.js';

import './ImageGroup.css';

class ImageGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      images: [],
      isLoading: false,
      offset: 0,
      totalCount: 0,
    };

    this.containerRef = React.createRef();

    this.endpoint = this.endpoint.bind(this);
    this.fetchImages = this.fetchImages.bind(this);
    this.fetchImagesWhenInView = this.fetchImagesWhenInView.bind(this);
    this.isContainerMostlyInView = this.isContainerMostlyInView.bind(this);
    this.title = this.title.bind(this);
  }

  componentDidMount() {
    this.fetchImages();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.fetchImagesWhenInView, { passive: true });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.images.length !== this.state.images.length) {
      window.removeEventListener('scroll', this.fetchImagesWhenInView, { passive: true });

      if (this.state.images.length < this.state.totalCount) {
        if (this.isContainerMostlyInView()) {
          this.fetchImages();
        } else {
          window.addEventListener('scroll', this.fetchImagesWhenInView, { passive: true });
        }
      }
    }
  }

  fetchImages() {
    window.removeEventListener('scroll', this.fetchImagesWhenInView, { passive: true });
    this.setState({ isLoading: true });

    fetch(this.endpoint())
      .then(res => res.json())
      .then(({ images, totalCount }) => this.setState(prevState => ({
        images: [...prevState.images, ...images],
        isLoading: false,
        offset: prevState.images.length + images.length,
        totalCount,
      })));
  }

  fetchImagesWhenInView() {
    if (this.isContainerMostlyInView()) {
      this.fetchImages();
    }
  }

  isContainerMostlyInView() {
    return this.containerRef.current.getBoundingClientRect().bottom <= window.innerHeight + 20;
  }

  endpoint() {
    return `/api/images?attribute=${this.props.attribute}&attributeValue=${
      this.props.attributeValue}&limit=${this.props.limit}&offset=${this.state.offset}`;
  }

  title() {
    if (!this.props.attributeValue) {
      return null;
    }

    return <h1 className='ImageGroup-title'>{this.props.attributeValue}</h1>;
  }

  render() {
    return (
      <div className='ImageGroup' ref={this.containerRef}>
        {this.title()}
        <h2 className='ImageGroup-subtitle'>{this.state.totalCount} Total</h2>

        <ul className='ImageGroup-images-list'>
          {
            this.state.images.map(image =>
              <li key={image.thumbnailUrl} className='ImageGroup-images-list-item'>
                <Image image={image} onClick={this.props.onImageSelect} />
              </li>
            )
          }
        </ul>

        {this.state.isLoading && <LoadingIndicator />}
      </div>
    );
  }
}

ImageGroup.propTypes = {
  attribute: PropTypes.string.isRequired,
  attributeValue: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  onImageSelect: PropTypes.func.isRequired,
};

ImageGroup.defaultProps = {
  attribute: '',
  attributeValue: '',
  limit: 3,
};

export default ImageGroup;
