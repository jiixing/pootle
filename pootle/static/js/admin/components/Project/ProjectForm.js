/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import React from 'react';

import FormElement from 'components/FormElement';
import ModelFormMixin from 'mixins/ModelFormMixin';

import ItemDelete from '../ItemDelete';


const ProjectForm = React.createClass({

  propTypes: {
    collection: React.PropTypes.object.isRequired,
    onDelete: React.PropTypes.func,
    onSuccess: React.PropTypes.func.isRequired,
  },

  mixins: [ModelFormMixin],

  fields: ['code', 'fullname', 'checkstyle', 'localfiletype', 'treestyle',
           'source_language', 'report_email', 'screenshot_search_prefix',
           'disabled'],


  /* Handlers */

  handleSuccess(model) {
    this.props.onSuccess(model);
  },


  /* Layout */

  render() {
    const model = this.getResource();
    const { errors } = this.state;
    const { formData } = this.state;

    return (
      <form method="post"
            id="item-form"
            onSubmit={this.handleFormSubmit}>
        <div className="fields">
          <FormElement
            autoFocus
            attribute="code"
            disabled={model.hasOwnProperty('id')}
            label={gettext('Code')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            attribute="fullname"
            label={gettext('Full Name')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            type="select"
            clearable={false}
            attribute="checkstyle"
            options={model.getFieldChoices('checkstyle')}
            label={gettext('Quality Checks')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            type="select"
            clearable={false}
            attribute="localfiletype"
            options={model.getFieldChoices('localfiletype')}
            label={gettext('File Type')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            type="select"
            clearable={false}
            attribute="treestyle"
            options={model.getFieldChoices('treestyle')}
            label={gettext('Project Tree Style')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            type="select"
            clearable={false}
            attribute="source_language"
            options={model.getFieldChoices('source_language')}
            label={gettext('Source Language')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            attribute="ignoredfiles"
            label={gettext('Ignore Files')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            type="email"
            attribute="report_email"
            label={gettext('String Errors Contact')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            attribute="screenshot_search_prefix"
            label={gettext('Screenshot Search Prefix')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
          <FormElement
            type="checkbox"
            attribute="disabled"
            label={gettext('Disabled')}
            handleChange={this.handleChange}
            formData={formData}
            errors={errors} />
        </div>
        <div className="buttons">
          <input type="submit" className="btn btn-primary"
                 disabled={!this.state.isDirty}
                 value={gettext('Save')} />
        {model.id &&
          <ul className="action-links">
            <li><a href={model.getAbsoluteUrl()}>{gettext('Overview')}</a></li>
            <li><a href={model.getLanguagesUrl()}>{gettext('Languages')}</a></li>
            <li><a href={model.getPermissionsUrl()}>{gettext('Permissions')}</a></li>
          </ul>}
        </div>
      {this.props.onDelete &&
        <div>
          <p className="divider" />
          <div className="buttons">
            <ItemDelete item={model} onDelete={this.props.onDelete} />
          </div>
        </div>}
      </form>
    );
  },

});


export default ProjectForm;
