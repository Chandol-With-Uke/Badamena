package ventee.entity;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class UserProductId implements Serializable {

    private Integer userId;
    private Integer productId;

    public UserProductId() {
    }

    public UserProductId(Integer userId, Integer productId) {
        this.userId = userId;
        this.productId = productId;
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        UserProductId that = (UserProductId) o;
        return userId.equals(that.userId) && productId.equals(that.productId);
    }

    @Override
    public int hashCode() {
        return 31 * userId.hashCode() + productId.hashCode();
    }
}
