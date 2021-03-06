var sinon = require('sinon');

describe('controller', () => {

  var ModalService = null;
  var $httpBackend = null;
  var $timeout = null;

  angular.module('controllertests', ['angularModalService'])
    .controller('CloseController', ($scope, close) => {
      $scope.close = close;
    })
    .controller('InputsController', ($scope, input1, input2, close) => {
      $scope.input1 = input1;
      $scope.input2 = input2;
      $scope.close = close;
    })
    //  Important: 'controllerAs' functions are bound to 'this', this is very
    //  important, we CANNOT change the below to an arrow function.
    .controller('ControllerAsController', function() {
      var vm = this;
      vm.character = "Fry";
      vm.checkValidity = () => {
        return vm.ExampleForm.$valid;
      }
    })
    .controller('ElementController', ($scope, $element) => {
      $scope.getElement = () => { return $element; };
    })
    .controller('OnInitController', function() {
      this.$onInit = sinon.spy();
    });

  beforeEach(() => {
    angular.mock.module('controllertests');
    inject((_ModalService_, $injector) => {
      ModalService = _ModalService_;
      $httpBackend = $injector.get('$httpBackend');
      $timeout = $injector.get('$timeout');
      $httpBackend.when('GET', 'some/controllertemplate.html').respond("<div id='controllertemplate'>controller template</div>");
      $httpBackend.when('GET', 'some/formtemplate.html').respond(
        "<form name='formCtrl.ExampleForm'><input type='text' name='exampleInput'></form>"
      );
    });
  });

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should inject the close function into the controller', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: "CloseController",
      templateUrl: "some/controllertemplate.html"
    }).then((modal) => {

      //  The controller we've created should put the close function on
      //  the scope, this is how we test it's been passed.
      expect(modal.scope.close).not.to.equal(undefined);

    });

    $httpBackend.flush();

  });

  it('should inject inputs to the controller', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: "InputsController",
      templateUrl: "some/controllertemplate.html",
      inputs: {
        input1: 15,
        input2: "hi"
      }
    }).then((modal) => {

      //  The controller sets the inputs on the scope.
      expect(modal.scope.input1).to.equal(15);
      expect(modal.scope.input2).to.equal("hi");

    });

    $httpBackend.flush();

  });

  it('should add a controller to the scope if controllerAs is used', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: 'ControllerAsController',
      controllerAs: 'futurama',
      templateUrl: 'some/controllertemplate.html'
    }).then((modal) => {

      //  The controller should be on the scope.
      expect(modal.scope.futurama).not.to.equal(null);

      //  Fields defined on the controller instance should be on the
      //  controller on the scope.
      expect(modal.scope.futurama.character).to.equal('Fry');

    });

    $httpBackend.flush();

  });

  it('should add a controller to the scope if the controller is inlined', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: ($scope) => {
        $scope.character = "Fry";
      },
      templateUrl: 'some/controllertemplate.html'
    }).then((modal) => {


      expect(modal.scope).not.to.equal(null);
      expect(modal.scope.character).to.equal('Fry');

    });

    $httpBackend.flush();

  });

  it('should add a controller to the scope if the controller is inlined with controllerAs', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: function() {
        this.character = "Fry";
      },
      controllerAs: 'futurama',
      templateUrl: 'some/controllertemplate.html'
    }).then((modal) => {

      //  The controller should be on the scope.
      expect(modal.scope.futurama).not.to.equal(null);

      //  Fields defined on the controller instance should be on the
      //  controller on the scope.
      expect(modal.scope.futurama.character).to.equal('Fry');

    });

    $httpBackend.flush();

  });


  it('should add a controller to the scope if the controller is inlined with controllerAs and also annotated', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: ['$http', function ($http) {
        expect($http).not.to.equal(null);
        this.character = "Fry";
      }],
      controllerAs: 'futurama',
      templateUrl: 'some/controllertemplate.html'
    }).then((modal) => {

      //  The controller should be on the scope.
      expect(modal.scope.futurama).not.to.equal(null);

      //  Fields defined on the controller instance should be on the
      //  controller on the scope.
      expect(modal.scope.futurama.character).to.equal('Fry');

    });

    $httpBackend.flush();

  });

  it('should inject the modal element into the controller', () => {

    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: 'ElementController',
      templateUrl: 'some/controllertemplate.html'
    }).then((modal) => {

      //  The controller should be on the scope.
      expect(modal.scope.getElement()).not.to.equal(undefined);

    });

    $httpBackend.flush();

  });

  it('should correct process form with controllerAs.form syntax', () => {

    $httpBackend.expectGET('some/formtemplate.html');

    ModalService.showModal({
      controller: 'ControllerAsController',
      controllerAs: 'formCtrl',
      templateUrl: 'some/formtemplate.html'
    }).then((modal) => {
      expect(modal.scope.formCtrl.ExampleForm).not.to.equal(undefined);
      expect(modal.scope.formCtrl.checkValidity()).to.equal(true);
    });

    $httpBackend.flush();

  });

  it('should run the controller\'s $onInit function if specified', () => {
    $httpBackend.expectGET('some/controllertemplate.html');

    ModalService.showModal({
      controller: 'OnInitController',
      templateUrl: 'some/controllertemplate.html'
    }).then((modal) => {
      sinon.assert.calledOnce(modal.controller.$onInit);
    });

    $httpBackend.flush();
  });
});
