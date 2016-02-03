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


const UserForm = React.createClass({

  propTypes: {
    collection: React.PropTypes.object.isRequired,
    onDelete: React.PropTypes.func,
    onSuccess: React.PropTypes.func.isRequired,
  },

  mixins: [ModelFormMixin],

  fields: [
    'username', 'is_active', 'password', 'full_name', 'email',
    'is_superuser', 'twitter', 'linkedin', 'website', 'bio',
  ],


  /* Handlers */

  handleSuccess(model) {
    this.props.onSuccess(model);
  },


  /* Layout */

  render() {
    const model = this.getResource();
    const { errors } = this.state;
    const { formData } = this.state;
    const deleteHelpText = gettext('Note: when deleting a user their contributions to the site, e.g. comments, suggestions and translations, are attributed to the anonymous user (nobody).');

    return (
      <form method="post"
            id="item-form"
            autoComplete="off"
            onSubmit={this.handleFormSubmit}>
        <div className="fields">
          <FormElement
              autoFocus={!model.isMeta()}
              readOnly={model.isMeta()}
              attribute="username"
              label={gettext('Username')}
              handleChange={this.handleChange}
              formData={formData}
              errors={errors} />
        {!model.isMeta() &&
          <div className="no-meta">
            <FormElement
                type="checkbox"
                attribute="is_active"
                label={gettext('Active')}
                handleChange={this.handleChange}
                formData={formData}
                errors={errors} />
            <FormElement
                type="password"
                attribute="password"
                label={gettext('Password')}
                placeholder={gettext('Set a new password')}
                handleChange={this.handleChange}
                formData={formData}
                errors={errors} />
          </div>}
          <FormElement
              autoFocus={model.isMeta()}
              attribute="full_name"
              label={gettext('Full Name')}
              handleChange={this.handleChange}
              formData={formData}
              errors={errors} />
          <FormElement
              attribute="email"
              label={gettext('Email')}
              handleChange={this.handleChange}
              formData={formData}
              errors={errors} />
        {!model.isMeta() &&
          <div className="no-meta">
            <FormElement
                type="checkbox"
                attribute="is_superuser"
                label={gettext('Administrator')}
                handleChange={this.handleChange}
                formData={formData}
                errors={errors} />
            <p className="divider" />
            <FormElement
                attribute="twitter"
                label={gettext('Twitter')}
                handleChange={this.handleChange}
                placeholder={gettext('Twitter username')}
                formData={formData}
                errors={errors}
                maxLength="15" />
            <FormElement
                attribute="linkedin"
                label={gettext('LinkedIn')}
                handleChange={this.handleChange}
                placeholder={gettext('LinkedIn profile URL')}
                formData={formData}
                errors={errors} />
            <FormElement
                attribute="website"
                label={gettext('Website')}
                handleChange={this.handleChange}
                placeholder={gettext('Personal website URL')}
                formData={formData}
                errors={errors} />
            <FormElement
                type="textarea"
                attribute="bio"
                label={gettext('Short Bio')}
                handleChange={this.handleChange}
                placeholder={gettext('Personal description')}
                formData={formData}
                errors={errors} />
          </div>}
        </div>
        <div className="buttons">
          <input type="submit" className="btn btn-primary"
                 disabled={!this.state.isDirty}
                 value={gettext('Save')} />
        {model.id &&
          <ul className="action-links">
            <li><a href={model.getProfileUrl()}>{gettext('Public Profile')}</a></li>
            <li><a href={model.getSettingsUrl()}>{gettext('Settings')}</a></li>
            <li><a href={model.getStatsUrl()}>{gettext('Statistics')}</a></li>
            <li><a href={model.getReportsUrl()}>{gettext('Reports')}</a></li>
          </ul>}
        </div>
      {(this.props.onDelete && !model.isMeta()) &&
        <div>
          <p className="divider" />
          <div className="buttons">
            <ItemDelete
              item={model}
              onDelete={this.props.onDelete}
              helpText={deleteHelpText}
            />
          </div>
        </div>}
      </form>
    );
  },

});


export default UserForm;
