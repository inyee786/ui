import C from 'ui/utils/constants';
import Route from '@ember/routing/route';
import RSVP, { reject } from 'rsvp';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  access         : service(),
  cookies        : service(),
  github         : service(),
  modal          : service(),
  prefs          : service(),
  settings       : service(),
  globalStore    : service(),

  queryParams: {
    config: {
      refreshModel: false
    },
    code: {
      refreshModel: false
    },
    state: {
      refreshModel: false
    },
    authProvider: {
      refreshModel: false
    },
    error_description: {
      refreshModel: false
    },
    login: {
      refreshModel: false
    }

  },

  model(params/* , transition */) {
    if (window.opener) {
      let openerController = window.opener.lc('security.authentication.github');
      let openerStore      = get(openerController, 'globalStore');
      let qp               = get(params, 'config') || get(params, 'authProvider');
      let type             = `${qp}Config`;
      let config           = openerStore.getById(type, qp);
      let gh = get(this, 'github');
      let stateMsg = 'Authorization state did not match, please try again.';

      if (get(params, 'config') === 'github') {

        return gh.testConfig(config).then((resp) => {
          gh.getAuthorizeUrl(resp, openerController.get('github.state'));
        }).catch(err => {
          this.send('gotError', err);
        });

      }

      if (get(params, 'code')) {
        // TODO see if session.githubState works here
        if (openerController.get('github').stateMatches(get(params, 'state'))) {
          reply(params.error_description, params.code);
        } else {
          reply(stateMsg);
        }
      }

    }

    if (get(params, 'code') && get(params, 'login')) {
      if (get(this, 'github').stateMatches(get(params, 'state'))) {
        let ghProvider = get(this, 'access.providers').findBy('id', 'github');
        return ghProvider.doAction('login', {
          code: get(params, 'code'),
          responseType: 'cookie',
        }).then(() => {
          return this.transitionTo('authenticated');
        });
      }

    }

    function reply(err,code) {
      try {
        window.opener.window.onGithubTest(err,code);
        setTimeout(function() {
          window.close();
        },250);
        return new RSVP.promise();
      } catch(e) {
        window.close();
      }
    }
  }
});
