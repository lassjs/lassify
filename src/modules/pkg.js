import { sep } from 'node:path';
import prompts from 'prompts';
import isSANB from 'is-string-and-not-blank';
import validateNpm from 'validate-npm-package-name';
import * as _ from '../helpers/_.js';

async function pkg() {
  const debug = this.debug.extend('pkg');
  const { spinner } = this;

  debug('%O', this.packageJson);

  if (_.isEmpty(this.packageJson))
    spinner.warn('Initializing new package.json');

  if (
    !isSANB(this.packageJson.name) ||
    !validateNpm(this.packageJson.name).validForNewPackages
  ) {
    debug('asking for name');
    const { name } = await prompts({
      type: 'text',
      name: 'name',
      initial: this.cwd.split(sep)[this.cwd.split(sep).length - 1],
      message: `  What is the name of you of your new project??`,
      validate: (name) =>
        validateNpm(name).validForNewPackages
          ? true
          : 'not a valid npm package name!'
    });

    debug('response: %s', name);

    this.packageJson.name = name;

    await this.writePackageJson();
  }

  if (!isSANB(this.packageJson.description)) {
    debug('asking for description');
    const { description } = await prompts({
      type: 'text',
      name: 'description',
      initial: 'my awesome project!',
      message: `  Describe your new project`,
      validate: (value) =>
        /"/.test(value) ? 'description cannot contain double quotes' : true
    });

    debug('response: %s', description);

    this.packageJson.description = description;

    await this.writePackageJson();
  }

  if (!isSANB(this.pm)) {
    debug('asking for package manager');
    const choices = ['npm', 'yarn'];
    const { pm } = await prompts({
      name: 'pm',
      message: '  Choose a package manager',
      choices,
      type: 'select',
      initial: 0
    });

    debug('package manager %s', choices[pm]);

    this.pm = choices[pm];
  }
}

export default pkg;
