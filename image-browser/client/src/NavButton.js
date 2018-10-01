import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './NavButton.css';

class NavButton extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.value);
  }

  render() {
    return (
      <button
        className={`NavButton${this.props.isSelected ? ' NavButton-selected' : ''}`}
        onClick={this.onClick}
      >{this.props.value}</button>
    );
  }
}

NavButton.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

NavButton.defaultProps = {
  isSelected: false,
};

export default NavButton;
