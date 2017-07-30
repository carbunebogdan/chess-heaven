describe('login', function() {
  it('should login', function() {
    browser.get('http://localhost:3000/#!/login');

    element(by.model('userLogin.username')).sendKeys('bogdan');
    element(by.model('userLogin.password')).sendKeys('amparola');
    element(by.xpath('//*[@id="tab-content-0"]/div/md-content/div/form/div/button')).click();

    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#!/manager');

  });
});