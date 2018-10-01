import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './LoadingIndicator.css';

class LoadingIndicator extends Component {
  render() {
    return (
      <div style={{ width: this.props.containerWidth }}>
        <div
          className='LoadingIndicator-spinner'
          style={{ marginBottom: this.props.verticalMargin, marginTop: this.props.verticalMargin }}
        >
          <div className='LoadingIndicator-bounce1'></div>
          <div className='LoadingIndicator-bounce2'></div>
          <div className='LoadingIndicator-bounce3'></div>
        </div>
      </div>
    );
  }
}

LoadingIndicator.propTypes = {
  containerWidth: PropTypes.any.isRequired,
  verticalMargin: PropTypes.number.isRequired,
};

LoadingIndicator.defaultProps = {
  containerWidth: 'auto',
  verticalMargin: 50,
};

export default LoadingIndicator;
