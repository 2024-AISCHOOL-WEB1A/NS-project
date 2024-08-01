const express = require("express");
const router = express.Router();
const db = require("../../conf/db");
const s3 = require("../../conf/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
// redis
const { getValue } = require("../../utils/redisUtils");

// jwt
const {
    generateAccessToken,
    getUserIdInRefreshToken,
} = require("../../utils/jwt");
const authenticateToken = require("../../middlewares/authenticateToken");

// 엑세스 토큰 재발행
router.post("/token", async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    let refreshToken = authHeader && authHeader.split(" ")[1];

    // header에 refreshToken이 없는 경우
    if (!refreshToken) {
        // 쿠키에서 검색
        refreshToken = req.cookies.refreshToken;

        // 그래도 없으면 Error
        if (!refreshToken) {
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return next({
                code: "AUTH_INVALID_TOKEN",
            });
        }
    }

    try {
        // refresh Token에서 userId 가져오기
        const userId = await getUserIdInRefreshToken(req);
        // Redis에서 refresh token 조회
        const getRefreshToken = await getValue(userId);
        // redis에 토큰이 없거나 다른 경우 (null 검사도 하는 이유는 둘 모두 null일 수 있으므로)
        if (getRefreshToken == null || refreshToken != getRefreshToken) {
            // 비정상 토큰
            return next({
                code: "AUTH_INVALID_TOKEN",
            });
        }

        // 조회가 성공한 경우 (만료는 위에서 없으면 만료된거다)
        // 새로운 accessToken 발행
        const accessToken = generateAccessToken(res, userId);

        // client에 응답 (token 재발행 success)
        return res.success({
            accessToken: accessToken,
        });
    } catch (e) {
        return next({
            code: "AUTH_INVALID_TOKEN",
        });
    }

    // // db에서 refresh token 조회
    // const query = `SELECT refresh_token, member_id, expires_at
    //     FROM REFRESH_TOKEN_TB
    //     WHERE refresh_token = ?`;
    // db.execute(query, [refreshToken], async (err, rows) => {
    //     if (err || rows.length <= 0) {
    //         res.clearCookie("refreshToken");
    //         res.clearCookie("accessToken");
    //         return next({
    //             code: "AUTH_INVALID_TOKEN",
    //         });
    //     }

    //     // 조회 성공한 경우
    //     const row = rows[0];

    //     // 만료 여부 확인
    //     if (new Date(row.expires_at) < new Date()) {
    //         await db.execute("DELETE FROM REFRESH_TOKEN_TB WHERE token = ?", [
    //             refreshToken,
    //         ]);
    //         return next({
    //             code: AUTH_EXPIRED_TOKEN,
    //         });
    //     }

    //     // 새로운 accessToken 발행
    //     const accessToken = generateAccessToken(res, row.member_id);

    //     // client에 응답 (token 재발행 success)
    //     return res.success({
    //         accessToken: accessToken,
    //     });
    // });
});

// presignedURL (s3 upload)
router.post(
    "/upload-image/:type",
    authenticateToken,
    async (req, res, next) => {
        const { fileName, fileType } = req.body;
        const { type } = req.params;
        const folder = `images/${type}`;
        const uniqueFileName = `${uuidv4()}-${fileName}`;
        const key = `${folder}/${uniqueFileName}`;

        // console.log(fileName, fileType);

        // upload type 종류 제한
        if (
            type !== "recipe" &&
            type !== "meal-log" &&
            type !== "recipe-recommend"
        ) {
            return next({
                code: "VALIDATION_ERROR",
            });
        }

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        try {
            const url = await getSignedUrl(s3, command, {
                expiresIn: 300,
            }); // 5분
            return res.success({
                url: url,
                key: key,
            });
        } catch (err) {
            console.log(err);
            return next({
                code: "SERVER_SERVICE_UNAVAILABLE",
            });
        }
    }
);

module.exports = router;
