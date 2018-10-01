import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LoadingIndicator from './LoadingIndicator.js';
import NavButton from './NavButton.js';

import './Nav.css';

class Nav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attributes: [],
      attributeValues: [],
      areAttributesLoading: true,
      areAttributeValuesLoading: false,
      selectedAttribute: '',
      selectedAttributeValue: '',
    };

    this.attributeValuesSection = this.attributeValuesSection.bind(this);
    this.fetchAttributeValues = this.fetchAttributeValues.bind(this);
    this.onNavSelect = this.onNavSelect.bind(this);
    this.updateSelectedAttribute = this.updateSelectedAttribute.bind(this);
    this.updateSelectedAttributeValue = this.updateSelectedAttributeValue.bind(this);
  }

  componentDidMount() {
    fetch('/api/imageAttributes')
      .then(res => res.json())
      .then(attributes => this.setState({ areAttributesLoading: false, attributes }));

    this.onNavSelect();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.selectedAttribute &&
        this.state.selectedAttribute !== prevState.selectedAttribute
    ) {
      this.fetchAttributeValues(this.state.selectedAttribute);
    }

    if (
      this.state.selectedAttribute !== prevState.selectedAttribute ||
        this.state.selectedAttributeValue !== prevState.selectedAttributeValue
    ) {
      this.onNavSelect();
    }
  }

  onNavSelect() {
    this.props.onNavSelect(this.state.selectedAttribute, this.state.selectedAttributeValue);
  }

  fetchAttributeValues(attribute) {
    this.setState({ areAttributeValuesLoading: true });

    fetch(`/api/imageAttributes/${attribute}`)
      .then(res => res.json())
      .then(attributeValues =>
        this.setState({ areAttributeValuesLoading: false, attributeValues })
      );
  }

  updateSelectedAttribute(selectedAttribute) {
    this.setState({
      attributeValues: [],
      selectedAttribute: (
        selectedAttribute === this.state.selectedAttribute ? '' : selectedAttribute
      ),
      selectedAttributeValue: '',
    });
  }

  updateSelectedAttributeValue(selectedAttributeValue) {
    this.setState({
      selectedAttributeValue: (
        selectedAttributeValue === this.state.selectedAttributeValue ? '' : selectedAttributeValue
      ),
    });
  }

  attributeValuesSection() {
    if (!this.state.selectedAttribute) {
      return null;
    }

    return (
      <div className='Nav-attribute-values'>
        <h1 className='Nav-header'>{this.state.selectedAttribute}</h1>

        <ul className='Nav-buttons-list'>
          {
            this.state.attributeValues.map(attributeValue => {
              const attributeValueStr = attributeValue.toString();

              return (
                <li key={attributeValueStr} className='Nav-buttons-list-item'>
                  <NavButton
                    isSelected={attributeValueStr === this.state.selectedAttributeValue}
                    onClick={this.updateSelectedAttributeValue}
                    value={attributeValueStr}
                  />
                </li>
              );
            })
          }
        </ul>

        {
          this.state.areAttributeValuesLoading &&
            <LoadingIndicator containerWidth={100} verticalMargin={30} />
        }
      </div>
    );
  }

  render() {
    return (
      <div className='Nav'>
        <div className='Nav-attributes'>
          <h1 className='Nav-header'>Group By</h1>

          <ul className='Nav-buttons-list'>
            {
              this.state.attributes.map(attribute =>
                <li key={attribute} className='Nav-buttons-list-item'>
                  <NavButton
                    isSelected={attribute === this.state.selectedAttribute}
                    onClick={this.updateSelectedAttribute}
                    value={attribute}
                  />
                </li>
              )
            }
          </ul>

          {
            this.state.areAttributesLoading &&
              <LoadingIndicator containerWidth={100} verticalMargin={30} />
          }
        </div>

        {this.attributeValuesSection()}
      </div>
    );
  }
}

Nav.propTypes = {
  onNavSelect: PropTypes.func.isRequired,
};

export default Nav;
