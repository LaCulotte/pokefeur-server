# Dealership Controller

A data singleton associates users to a `UserDealsController`.

## UserDealsController

The `UserDealsController` is created :
- When the server starts, for every existing user
- When a user is created

Its goal is to manage which deal is available for a specific user.

The `UserDealsController` contains a list of `DealController`s. This list defines which deals the user has access to. It is creating using the `generateDeals` function.

Upon creation, the `UserDealsController` will 'attach' its `DealController`s to the user's existing deals (see below what it means). If a deal contained in the user data is not associated with any controller, this means the deal is no longer activly proposed to the user. Thus, if the deal is in the 'proposed' or 'redeemed' state, we remove it from its data.

Then, the `UserDealsController` will attach each of its associated controller

## DealController

Every `DealController` has a type associated to it. \
Its goal is to update a specific deal attached to a user.

When created, it is not associated with any user deal. \
The `UserDealsController` will usually try to attach a `DealController` to each of the user deal until successful. \
Attaching means that we try to set the deal controlled by a `DealController` to an already existing user deal. This way, the controller will the update it properly and take proper care of it. \
A `DealController` can only attach to a deal that have the same type as the controller.

Then, the `UserDealsController` will usually then 'update' the the `DealController`. If the controller is not attached to any deal, it will then generate a new one. If it is attached to a deal that is expired and not in the 'accepted' state, it will also generate a new one. Otherwise, if the deal is not already expired, it will set a timeout to the *`handleExpired`* callback.

When generating a new deal, it will use its 'type' to generate the deal's cost, reward, timeout (expiration) and wait time (between accept and redeem). It will also set a timeout to the *`handleExpired`* callback. We clear any already existing timeout to avoid callbacks missfire.

### Callbacks 

#### *`handleExpired`*

If the deal is in the 'proposed' or 'redeemed' state, then we generate a new deal. \
Otherwise, we are in the 'accepted' state, thus we clear the updateTimeout member, indicating the deal already expired and can be regenerated at the next occasion.

#### *`handleRedeemed`*

Called when a user redeems the underlying deal. \
If the `DealController` is not attached to any deal, we regenerate one (the state is invalid). \
If the deal is expired, we delete it and regenerate a new one. Otherwise we do nothing as the deal generation will be handled with the `handleExpired` callback 