import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model: function() {
    let gs = get(this, 'globalStore');
    return hash({
      githubConfig: gs.find('authconfig', 'github'),
      principals: gs.findAll('principal')
    })
  },

  setupController: function(controller, model) {
    let hostname = get(model, 'githubConfig.hostname')
    controller.setProperties({
      model: model,
      confirmDisable: false,
      testing: false,
      organizations: get(this, 'session.orgs')||[],
      errors: null,
      isEnterprise: ( hostname && hostname !== 'github.com' ? true : false),
    });

    controller.set('saved',true);
  }
});
