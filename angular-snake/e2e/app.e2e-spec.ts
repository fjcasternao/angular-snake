import { AngularSnakePage } from './app.po';

describe('angular-snake App', () => {
  let page: AngularSnakePage;

  beforeEach(() => {
    page = new AngularSnakePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
